# Decision log

Add new entries at the bottom. Do not rewrite old ones; supersede them with a new entry.

| ID | Decision | Why |
|----|----------|-----|
| D1 | Web app, no Tauri | Browser access, no installers or auto-update |
| D2 | NestJS modular monolith + PostgreSQL 16 | One deployable, strict module boundaries |
| D3 | Local server PC at Azoan first, online later | Config-only move later (12-factor) |
| D4 | Linux mini PC preferred over Windows + Docker Desktop | Reliability |
| D5 | Tailscale/WireGuard for remote access, no port forwarding | Security |
| D6 | Real subdomain to private IP with Caddy DNS-01 TLS (when a domain exists) | No local CA installs |
| D7 | argon2id, httpOnly cookie, server-side sessions, TOTP for Admin (M1) | Easy revocation |
| D8 | UI language English, i18n-ready | Malayalam can be added later |
| D9 | No custom remote-desktop tool; log AnyDesk/RustDesk session ID | Scope |
| D10 | Contract-first via zod in `packages/shared` | Safe parallel agents |
| D11 | Warranty = 24 months from date of sale | Business rule |
| D12 | End customers: purchase details only, UID optional | Business rule |
| D13 | Ask once, reuse everywhere | Business rule |
| D14 | Technicians: phone + one-line problem is enough | Business rule |
| D15 | No proof of sale: refer to management | Business rule |
| D16 | TypeScript pinned to 5.9 (not 7.x) | tsup's declaration build (rollup-plugin-dts) crashes on TS 7. Revisit when tsup supports it |
| D17 | Plain SQL migrations with a ~60-line runner (`src/db/migrate.ts`), Drizzle only for queries | Agents can write SQL directly; triggers and roles are first-class |
| D18 | Fonts (Inter, Noto Sans Malayalam) bundled via @fontsource | The server may have no internet; no CDN calls |
| D19 | Migrations run as the owner DB role; the app runs as a restricted role with no UPDATE/DELETE on `audit_log`, plus triggers that block changes even for the owner | Tamper-resistant audit |
| D20 | pnpm `allowBuilds` permits only esbuild install scripts | Supply-chain hygiene |
| D21 | Device data comes from two sources joined on UID: Azoan production list and Axentro sales list. Importer works with either alone; sale-date conflicts are never overwritten automatically | Azoan and Axentro are separate entities; real Axentro data is not yet available, so work proceeds against the sample files in `docs/samples/` |
| D22 | Catalog keyed on model code (`OPT-<2 letters>-<spec>`), website name kept as marketing name | Confirmed by the business |
| D23 | Edakkara, Malappuram is the operating head service centre; Sulthan Bathery and Kozhikode are reference locations only in v1 | Confirmed by the business |
