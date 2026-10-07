# Handoff

Last updated by: Claude (planning and M0 scaffold agent), 2026-10-07

## State
M0 is built and verified in a Linux sandbox:
- `pnpm check` passes (lint, typecheck, build, tests). With `TEST_DATABASE_URL` set to an empty Postgres 16 database, the migration and audit integration tests pass (6 server tests + 7 shared + 4 web).
- Server was started against a real Postgres 16 with the restricted app role: health, create ticket, list tickets, validation errors, audit rows with actor, and "permission denied" when the app role tries to delete from `audit_log` were all exercised by hand.
- The web app type-checks and builds. **It has not been looked at in a browser yet.**

## Not verified (no Docker or GitHub in the build sandbox)
- `docker compose up` (Dockerfiles, Compose, Caddyfile, Postgres init script)
- `ops/backup.sh` and the restore steps in `ops/RUNBOOK.md`
- The GitHub Actions workflow

## How to run locally
```
cp .env.example .env            # edit passwords; make DATABASE_URL match
# have a Postgres 16 with roles optier_owner (owner) and optier_app, database "optier"
pnpm install
pnpm --filter @optier/shared build
pnpm db:migrate && pnpm db:seed
pnpm dev                        # web on http://localhost:5173, API on :3000
```
Or on a server: `docker compose up -d --build` (see `ops/RUNBOOK.md`).

## Next
1. Run the Docker stack on the real Azoan PC and create a ticket from another machine. Fix whatever breaks and record it in `DECISIONS.md`.
2. Push to GitHub, confirm CI is green, enable branch protection requiring CI.
3. Start M1 (see `TASKS.md`), beginning with auth, because everything else needs a real actor.

## Known gaps and caveats
- No authentication yet: every request is acted as `"system"`. Do not expose the server beyond a trusted LAN until M1 is done.
- Audit endpoint `/api/audit/:table/:id` is unauthenticated until RBAC exists.
- Accent colour (`--accent` in `apps/web/src/styles.css`) is a placeholder; swap in the Optier brand colour.
- Package versions resolved at install time are recorded in `pnpm-lock.yaml`; keep `--frozen-lockfile` in CI.

## Open business questions (see docs/PLAN.md section 11)
Axentro sales data format, old complaint history import, SLA targets, PC specs and concurrent users, logo and brand colour.
