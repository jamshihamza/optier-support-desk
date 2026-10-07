# Optier Support Desk

Internal after-sales support desk for OPTIER products (Azoan Technologies India LLP).
Plan: [docs/PLAN.md](docs/PLAN.md). UI spec: [docs/UI.md](docs/UI.md). Agents: [AGENTS.md](AGENTS.md).

## Quick start (development)
Requires Node 22, pnpm, and PostgreSQL 16 with an owner role and a restricted app role (see `.env.example`).
```
cp .env.example .env
pnpm install
pnpm --filter @optier/shared build
pnpm db:migrate && pnpm db:seed
pnpm dev
```
Web: http://localhost:5173. Component reference: http://localhost:5173/dev/ui.

## Quick start (server PC)
```
cp .env.example .env     # set strong, URL-safe passwords
docker compose up -d --build
```
Then open `http://<server-ip>/`. Backups, restore and updates: [ops/RUNBOOK.md](ops/RUNBOOK.md).

## Keyboard shortcuts
`N` new ticket, `/` or `Ctrl+K` search, `G` then `T` tickets, `G` then `H` home, `Esc` close drawer.
