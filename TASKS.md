# Tasks

Mark `[x]` when done and committed. Agents: take the first unchecked task of the current milestone.

## M0: Foundation and walking skeleton
- [x] Monorepo (pnpm workspaces), Biome, TypeScript, Vitest
- [x] `packages/shared`: ticket/channel/status/priority schemas, ticket number format, warranty maths (tested)
- [x] Server: config, DB layer, health, tickets (create/list), audit read endpoint
- [x] Migrations: tickets, audit_log, audit trigger, immutability triggers, restricted app role grants
- [x] Migration runner + seed script; integration tests for migrations and audit (run with `TEST_DATABASE_URL`)
- [x] Web: design tokens (light/dark), app shell, shortcuts, connection banner, Home, Tickets list, quick-create drawer, `/dev/ui`
- [x] Docker: Dockerfiles, Compose, Caddyfile, backup script, runbook, CI workflow
- [x] Agent files: AGENTS.md, CLAUDE.md, DECISIONS.md, HANDOFF.md
- [ ] **Deploy the skeleton on the real Azoan PC** and create one ticket from another PC (Docker files are written but not yet run anywhere)
- [ ] Push to GitHub and confirm the CI workflow passes
- [ ] Playwright e2e for create-ticket flow
- [ ] Look at the UI in a browser on a real screen; adjust tokens (accent colour is a placeholder until the Optier logo is supplied)

## M1: Auth, RBAC, parties, catalog, devices
- [ ] Users, argon2id login, httpOnly cookie sessions in Postgres, logout, session revoke
- [ ] TOTP 2FA for Admin
- [ ] Permission-based RBAC (permissions table, roles as bundles) + guard + `audit.view` on the audit endpoint
- [ ] Replace the hard-coded `"system"` actor with the logged-in user
- [ ] `parties`: organizations (Azoan, Axentro, dealers) and contacts (phone is the lookup key; types: end customer, technician, Axentro staff, integrator)
- [ ] `catalog`: series, models, datasheet links
- [ ] `devices`: UID, batch, firmware, sale record, warranty status using `warrantyStatus()`
- [ ] CSV import for UIDs and Axentro sales data (preview + error report)
- [ ] Device lookup screen (UI.md 4.3)
- [ ] Admin screens: users, roles, audit viewer

## M2: Tickets in full (then pilot with 2 or 3 staff)
- [ ] Ticket detail: timeline (notes, calls, remote, onsite), internal/external toggle, attachments
- [ ] Quick-create rules from PLAN.md "Contact handling": open-case detection with one-click Log contact, technician minimal mode, purchase_record stored once and reused
- [ ] SLA clock with pause in waiting states, business hours, Kerala holiday calendar
- [ ] Management escalation and the "Refer to management" warranty decision flow
- [ ] Ticket filters, saved views, Kanban toggle

## M3 to M6
See `docs/PLAN.md` section 8 (RMA/QC, escalations, knowledge base, chat, dashboards, online hosting).

## Backlog (ideas, not approved)
- Command palette beyond focusing the search box
