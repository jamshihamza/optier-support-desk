# AGENTS.md

Instructions for coding agents (Codex, Claude Code). Read this, then `HANDOFF.md`, then `TASKS.md`.

## What this is
Optier Support Desk: an internal web app for Azoan Technologies' after-sales support of OPTIER cameras, NVRs and PoE switches. Full scope: `docs/PLAN.md`. UI spec: `docs/UI.md`. Decision log: `DECISIONS.md`.
v1 users are Azoan staff only. It runs as a local server on a PC at Azoan first, online later.

## Stack and layout
- `apps/server`: NestJS modular monolith, Drizzle ORM, PostgreSQL 16, plain SQL migrations in `apps/server/migrations`
- `apps/web`: React + TypeScript + Vite, Tailwind v4 (tokens in `src/styles.css`), TanStack Query, react-i18next, Anime.js (only through `src/lib/motion.ts`)
- `packages/shared`: zod schemas, types, shared pure logic (warranty maths). Built with tsup to CJS + ESM
- `ops/`: Caddyfile, backup script, runbook, Postgres init. Docker files at the repo root
- Node 22, pnpm 12 (`packageManager` is pinned). TypeScript is pinned to 5.9 on purpose (see DECISIONS.md D16)

## Commands
```
pnpm install
pnpm build            # builds shared, server, web (shared must be built before typecheck)
pnpm lint             # Biome. `pnpm format` fixes
pnpm typecheck
pnpm test             # set TEST_DATABASE_URL to a disposable empty DB to include DB integration tests
pnpm check            # build + lint + typecheck + test: must pass before every merge
pnpm dev              # shared watch + server watch + web dev server (needs a .env and a running Postgres)
pnpm db:migrate / pnpm db:seed
```

## Rules (do not skip)
1. **Contract first.** Change or add zod schemas in `packages/shared` before touching server or web. Rebuild shared (`pnpm --filter @optier/shared build`) so the other packages see it.
2. **Module boundaries.** Each server module in `apps/server/src/modules/<name>` exposes only its service. Never query another module's tables; call its service. Controllers validate with `ZodValidationPipe`.
3. **Migrations.** New file `apps/server/migrations/YYYYMMDDHHMMSS_name.sql` with the real current UTC timestamp. **Never edit a migration that has been merged**; add a new one. Update `src/db/schema.ts` by hand to match.
4. **Audit.** Writes to audited tables must go through `DbService.withActor(actor, tx => ...)` so the trigger records who acted. The app DB role must never get UPDATE/DELETE on `audit_log`.
5. **Business rules are settled** (see PLAN.md section 5 and decisions D11 to D15): warranty is 24 months from date of sale; end customers are asked for purchase details only, UID optional; never re-ask stored details; technicians need only phone + one-line problem; no proof of sale means refer to management.
6. **UI.** Use tokens and components (`/dev/ui` is the reference). All user-visible strings go through `t()` in `src/locales/en.json`. UI language is English. Times are stored in UTC and shown in IST. Never rely on colour alone. Keep animations within `docs/UI.md` section 5.
7. **No secrets in git.** Configuration comes from environment variables only; keep `.env.example` current.
8. **No scope creep.** Do the task in `TASKS.md` you were given. Note ideas in `TASKS.md` under Backlog instead of building them.

## Working style and handoff
- One task = one branch (`feat/<module>-<short>`) = small commits. **Commit after every working step**; usage limits can cut you off without warning.
- Two agents at once: use separate git worktrees and separate modules.
- Before stopping (or whenever a step finishes), update `HANDOFF.md`: what is done, what is next, blockers, how to verify. `TASKS.md` and `git log` are the source of truth if the two disagree.
- Definition of done: `pnpm check` passes with `TEST_DATABASE_URL` set, `TASKS.md` ticked, `HANDOFF.md` updated.
