# Task M1a: authentication, sessions and RBAC

Branch: `feat/auth-rbac`. Read `AGENTS.md` and `docs/PLAN.md` (sections 5 and 7) first. Contract first: schemas in `packages/shared` before server or web.
Do **not** build catalog or devices (that is task M1b, done after this one) and do **not** build TOTP 2FA yet (separate task). Work alone in this folder on this branch.

## Build
1. **Shared contracts**: `loginInputSchema` (email, password), `sessionUserSchema` (id, name, email, roles, permissions), and `packages/shared/src/permissions.ts` exporting the permission list (M1b will later use `device.view`, `device.import` and `catalog.manage` from this list). Initial permissions: `ticket.view`, `ticket.create`, `ticket.update`, `ticket.assign`, `device.view`, `device.import`, `catalog.manage`, `rma.view`, `rma.manage`, `knowledge.view`, `knowledge.manage`, `report.view`, `audit.view`, `user.manage`, `role.manage`.
2. **Migration** (new timestamped file): `users` (id uuid, email unique case-insensitive, name, password_hash, is_active, created_at), `roles`, `permissions`, `role_permissions`, `user_roles`, `sessions` (id, user_id, token_hash, created_at, last_seen_at, expires_at, revoked_at, ip, user_agent). Grant the app role what it needs and nothing more. Seed permissions and five roles: Admin (all), Manager, Support, QC/Repair, Viewer. Audit the user and role tables with the existing `audit_trigger()`; never log password hashes in audit rows (exclude or redact the column).
3. **auth module**: password hashing with argon2id (`@node-rs/argon2`; add it to the pnpm `allowBuilds` only if it needs an install script). Session token = 32 random bytes, stored only as a SHA-256 hash. Cookie: httpOnly, SameSite=Lax, Secure when the request is HTTPS, path `/`. Idle expiry 8 hours (sliding), absolute 30 days. Endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. Login failures return the same generic message for unknown email and wrong password. Rate limit: 5 failed attempts per email+IP per 15 minutes.
4. **rbac module**: global `AuthGuard` (everything requires a session except `/api/health` and `/api/auth/login`), `@RequirePermission('x.y')` decorator, and a `PermissionsGuard`. Admin always passes. Protect `/api/audit/*` with `audit.view`, `GET /api/tickets` with `ticket.view`, `POST /api/tickets` with `ticket.create`.
5. **Actor**: replace the hard-coded `"system"` in `TicketsService` with the logged-in user id (pass it from the controller).
6. **No default passwords.** Add `pnpm --filter @optier/server create-admin` (script `src/db/create-admin.ts`): prompts or takes `--email --name`, reads the password from a prompt or env, refuses weak passwords (minimum 12 characters), creates an Admin user.
7. **Web**: login page (English strings via `t()`), auth context using `GET /api/auth/me` through TanStack Query, protected routes redirecting to `/login`, logout in the user menu in the top bar, nav items hidden when the permission is missing, a plain "You do not have access" screen for 403, and the existing connection banner must keep working. 401 from any API call returns the user to login.
8. **Docs**: update `.env.example` if you add variables, `TASKS.md` (tick done items), `DECISIONS.md` (new entries only), `HANDOFF.md`.

## Acceptance
- `pnpm check` passes with `TEST_DATABASE_URL` set.
- Integration tests: login success and failure, session expiry and revoke, logout, guard returns 401 without a session and 403 without the permission, rate limit, audit rows show the user's id as actor, password hash never appears in the audit table.
- Manually: create an admin with the script, log in on the web app, create a ticket, open the audit endpoint for that ticket and see your user id, log out and confirm the API returns 401.
