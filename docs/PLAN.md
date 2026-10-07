# Optier Support Desk: Master Plan (v2)

Status: approved for M0. Owner: Azoan Technologies India LLP (after-sales for the OPTIER brand, sold via Axentro).
This file is the source of truth for scope and architecture. Change it through `DECISIONS.md` entries, not silently.

## 1. Goal

One internal web application where Azoan support staff log, track, and resolve after-sales queries, repairs, returns, and escalations for OPTIER products (Series 1 Pro, Series 2 Value, Series 3 Classic, Series 4 PoE switches). Every action is traceable.

v1 users: **Azoan staff only.** Axentro and dealer logins are a later phase.

## 2. Key decisions

| # | Decision | Reason |
|---|----------|--------|
| D1 | Web app, no Tauri | Runs in any browser, no installers or auto-update. |
| D2 | Modular monolith (NestJS) + PostgreSQL 16 | Single deployable, strict module boundaries. |
| D3 | Hosted first on one PC at Azoan (LAN), online later | Config-only move later (12-factor). |
| D4 | Linux mini PC preferred over Windows + Docker Desktop | Reliability. |
| D5 | Remote access for the second warehouse and field technicians through Tailscale/WireGuard | No port forwarding. |
| D6 | Real subdomain pointing to the private IP, TLS via Caddy DNS-01 | No local CA installs, no `.local` mDNS issues. |
| D7 | Auth: argon2id, httpOnly cookie, server-side sessions in Postgres, TOTP 2FA for Admin | Easy revocation. |
| D8 | UI language: English, i18n-ready (`react-i18next`) | Malayalam can be added later. |
| D9 | No custom remote-desktop tool | Log AnyDesk/RustDesk session IDs on the ticket instead. |
| D10 | Contract-first: zod schemas in `packages/shared` | Safe parallel work by two coding agents. |
| D11 | Warranty = **24 months from date of sale** (setting, default 24) | Confirmed by the business. |
| D12 | End customers are asked for purchase details only; UID is never mandatory | Customers rarely know the UID. |
| D13 | **Ask once, reuse everywhere**: purchase details and contact info are never re-asked for the same case or product | Reduces friction for customers and staff. |
| D14 | Technician contacts are frictionless: phone + one-line problem is enough to log | Technicians call often; process must not burden them. |
| D15 | No proof of sale at all means the case is **referred to management** for a warranty decision | Confirmed by the business. |

## 3. Stack

- Backend: NestJS, Drizzle ORM + plain SQL migrations, Socket.IO
- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui (Radix), TanStack Query, Recharts, Anime.js v4 (version pinned)
- Database: PostgreSQL 16 (`pg_trgm` for search)
- Files: storage adapter interface; local disk first, S3-compatible later
- Deploy: Docker Compose (`app`, `postgres`, `caddy`)
- Tooling: pnpm workspaces, Biome (lint and format), Vitest, Playwright, GitHub Actions
- Monorepo layout: `apps/web`, `apps/server`, `packages/shared`, `docs/`, `ops/`

## 4. Modules

Each module lives in `apps/server/src/modules/<name>` and exposes only a public service interface. **No cross-module table joins; call the other module's service.**

| Module | Responsibility |
|--------|----------------|
| `auth` | login, sessions, 2FA, users |
| `rbac` | permissions, roles, data scoping |
| `parties` | organizations (Azoan, Axentro, dealers) and contacts/customers (single module) |
| `catalog` | series, models, datasheet links, spec metadata |
| `devices` | UID, batch/lot, firmware, sale record, warranty |
| `tickets` | tickets, threads (internal/external notes), actions, SLA, escalations (OEM, management) |
| `rma` | received to QC to repair to testing to dispatch, courier, warehouse location |
| `knowledge` | known issues, articles, video links |
| `chat` | team chat (M4) |
| `files` | attachments through the storage adapter |
| `reports` | KPI queries, exports |
| `audit` | append-only audit log |

## 5. Domain rules

### Ticket lifecycle
`New` → `Triage` → `Troubleshooting` → (`Waiting for Customer` | `Waiting for OEM`) → (`Resolved` | `RMA` | `Management Escalation`) → `Closed`

- Waiting statuses **pause the SLA clock**.
- SLA uses business hours plus a Kerala holiday calendar. Times stored in UTC, shown in IST.
- Channels: WhatsApp, call, remote, onsite, email, other.
- Remote session ID (AnyDesk/RustDesk) is a ticket field.
- OEM escalation fields: case reference, sent date, reply date, reply notes.
- A ticket can be created with an **unregistered device** and linked to a UID later.

### Contact handling rules (who is asked what)

Contacts are recognised by **phone number**. Types: end customer, dealer/distributor technician, Axentro staff, integrator. A contact can belong to an organization (dealer, Axentro).

**End customers**
- Ask for **purchase details only**: purchase date (required), seller/dealer name (required), invoice number or photo (optional), product model if no UID is known (picked from catalog). UID is optional, never a blocker.
- Stored once as a `purchase_record` (contact + device or model + date + seller + proof) and linked to every ticket about that product.

**Ask once, reuse**
- A repeat message or call about an **open case** from the same contact is appended to the same ticket as a one-click timeline entry (call, WhatsApp, remote). No questions are asked again.
- A **new case** for a product with a stored purchase record shows the details prefilled; staff only confirm them.
- Contact count per case is tracked (a useful KPI for repeat chasing).

**Technicians (frequent callers)**
- Minimum to log: phone number + one-line problem. Everything else is optional and can be added later.
- Recognised by phone: organization prefilled, recent devices/sites suggested, last ticket shown.
- **No purchase details are asked from technicians.** Where needed, staff pick the end customer's record later.
- When a portal or WhatsApp channel arrives (M6), the same rule applies: no forms for technicians beyond the minimum.

### Device and warranty
- `Device(uid, model, batch, firmware, manufactured_at, sold_to, sold_at, invoice_ref)`.
- **Warranty rule (confirmed):** starts on the **date of sale**, lasts **24 months**. End date = sale date + 24 calendar months. Period is a global setting (default 24).
- **Sale date source, in priority order:**
  1. Axentro sale record matched by UID: *verified*
  2. Invoice proof attached and checked by staff: *verified*
  3. Date stated by the customer: *unverified* (shown with a flag; staff can verify later)
- **Warranty status:** In warranty, Expiring (30 days or less), Expired, Unverified (based on stated date), Unknown (no sale date).
- **Unknown = no proof of sale** (no UID sale record, no invoice, no stated date): staff continue troubleshooting normally, but any repair, replacement, or return needs a **management warranty decision**. A "Refer to management" action creates a management escalation on the ticket; the decision (approve as warranty, approve as goodwill, reject) and who made it are recorded and audited.
- If a UID has an Axentro record **and** the customer states a different date, the Axentro record wins and the mismatch is flagged for staff.
- UID and sales data are loaded by CSV bulk import (M1).

### Audit
- DB trigger writes the audit row; the app DB role has no UPDATE/DELETE on `audit_log`.
- Each transaction sets `SET LOCAL app.user_id`.
- Migrations run under a separate DB role.
- Optional later: hash chain.

### RBAC
- Permission-based (`ticket.assign`, `rma.close`, `report.view`, ...). Roles are bundles of permissions.
- Starter roles: Admin, Manager, Support, QC/Repair, Viewer.
- Data scoping by organization/location, ready for Axentro/dealer logins later.

### Search
Postgres `pg_trgm` plus `simple` text config (no Malayalam stemming exists). Test with Malayalam sample data.

## 6. Hosting and operations (local first)

- Linux mini PC, static IP or DHCP reservation, UPS, auto-start, sleep disabled.
- Daily backup: `pg_dump` **plus the uploads folder** to a second disk and to an offsite target; monthly restore test; written 1-hour restore runbook in `ops/RUNBOOK.md`.
- Single PC is a single point of failure; management must be told in writing.
- Online migration later: same Compose on a VPS, restore the dump, change DNS.
- 12-factor rules: all config via env, no hardcoded IPs or paths, stateless server, storage adapter, rate limiting, CORS config, `.env.example` committed.

## 7. Security and compliance

- argon2id passwords, 2FA for Admin, session revocation, login rate limiting.
- Never store customer remote-desktop passwords.
- Customer personal data: follow India's DPDP Act; define a retention policy before go-live.
- Uploads: size and type limits, served through an authenticated endpoint.

## 8. Milestones (vertical slices)

| Milestone | Scope |
|-----------|-------|
| **M0** (2-3 days) | Repo, monorepo, Compose, CI, agent files, migrations, UI tokens + shell, **walking skeleton deployed on the real Azoan PC** (one ticket end to end) |
| **M1** (1-2 weeks) | Auth, RBAC, parties, catalog, devices + UID, CSV import, audit |
| **M2** | Tickets, attachments, quick-create, device lookup; **pilot with 2-3 staff** |
| **M3** | RMA/QC, escalations, knowledge base |
| **M4** | Team chat, notifications |
| **M5** | KPI dashboards, polish, animation, mobile view for technicians |
| **M6** | Online hosting, WhatsApp/portal integration, Axentro/dealer logins |

Original ideas that stay out of v1: external customer chat, WhatsApp Business API, Tauri packaging.

## 9. KPIs

First response time, resolution time, SLA breach %, tickets per day/series/model, repeat-issue models, RMA rate, staff workload, batch-level defect view.

## 10. Agent workflow (Claude Code and Codex)

Files at repo root: `AGENTS.md` (Codex reads), `CLAUDE.md` (imports `@AGENTS.md`), `TASKS.md` (checklist), `DECISIONS.md`, `HANDOFF.md`.

Rules:
1. Contract first: add or change zod schemas in `packages/shared`, then server and web.
2. One task = one branch = small commits. **Commit after every working step**, because usage limits arrive without warning.
3. `TASKS.md` plus `git log` are the truth. `HANDOFF.md` is a convenience: what is done, what is next, blockers, how to run.
4. Parallel agents use separate git worktrees and separate modules. Migration files are timestamp-named.
5. Nothing merges unless `pnpm lint && pnpm typecheck && pnpm test` passes in CI.
6. Playwright e2e for the main flow (create ticket, link device, start RMA). CI checks migrations apply cleanly on an empty DB.
7. Seed script and `.env.example` must always work from a fresh clone.

## 11. Open items (need answers from the business)

1. SETTLED: warranty is 24 months from date of sale; no proof of sale means refer to management (D11, D15).
2. How Axentro sales data arrives (Excel, ERP export) and its columns.
3. Whether to import old complaint history (Excel/WhatsApp).
4. Azoan PC specs and expected concurrent users.
5. SLA targets per priority.
6. Brand colour and logo files for the UI.
