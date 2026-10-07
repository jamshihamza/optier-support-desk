# Developer setup

For the person running the coding agents (Claude Code, Codex). Do this on **your own computer**, not on the Azoan server PC.

## 1. Install the tools
| Tool | Why | Install |
|------|-----|---------|
| Git | version control | https://git-scm.com/downloads |
| Node.js 22 | runs the app | https://nodejs.org (LTS 22) |
| pnpm | package manager | `npm install -g pnpm@12.9.1` |
| Docker Desktop | development database | https://www.docker.com/products/docker-desktop |
| VS Code (optional) | editor | https://code.visualstudio.com |
| Claude Code | coding agent | Windows PowerShell: `irm https://claude.ai/install.ps1 \| iex`. Mac/Linux: `curl -fsSL https://claude.ai/install.sh \| bash`. Needs a paid Claude plan or API access. Git for Windows is recommended on Windows |
| Codex CLI | second coding agent | `npm install -g @openai/codex` (or the installer from the OpenAI Codex repository). Run `codex` and choose "Sign in with ChatGPT" (paid ChatGPT plan) |

Check: `git --version`, `node -v` (22 or newer), `pnpm -v`, `docker --version`, `claude --version`, `codex --version`.

## 2. Get the code and start the app
```
git clone https://github.com/jamshihamza/optier-support-desk.git
cd optier-support-desk
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
pnpm install
pnpm db:up                    # starts PostgreSQL in Docker (port 5432)
pnpm --filter @optier/shared build
pnpm db:migrate
pnpm db:seed                  # three demo tickets
pnpm dev                      # web: http://localhost:5173  API: http://localhost:3000
```
The default `.env.example` values already match the dev database. Stop everything with `Ctrl+C`, and the database with `pnpm db:down`.

Quality check before any commit or merge: `pnpm check`. To include the database tests, create an empty database and set `TEST_DATABASE_URL`:
```
docker compose -f docker-compose.dev.yml exec db createdb -U optier_owner optier_test
# then (bash)  export TEST_DATABASE_URL=postgres://optier_owner:change-me-owner@localhost:5432/optier_test
# or (PowerShell)  $env:TEST_DATABASE_URL="postgres://optier_owner:change-me-owner@localhost:5432/optier_test"
```

## 3. Run two agents in parallel (one worktree each)
Each agent gets its own folder and branch so they never overwrite each other.
```
git worktree add ../osd-auth    -b feat/auth-rbac
git worktree add ../osd-catalog -b feat/catalog-devices
```
For each worktree folder:
1. Copy `.env` from the main folder.
2. Give it its own database so migrations do not clash:
   `docker compose -f docker-compose.dev.yml exec db createdb -U optier_owner optier_auth`
   and set `DATABASE_URL` and `MIGRATION_DATABASE_URL` in that folder's `.env` to end with `/optier_auth` (use `optier_catalog` for the other).
3. Change `PORT` in `.env` (3001 and 3002) and, if you run the web app in both, start Vite on different ports.
4. `pnpm install`, then `pnpm --filter @optier/shared build`, `pnpm db:migrate`.

Start an agent inside the folder (`claude` or `codex`) and paste:
> Read AGENTS.md, HANDOFF.md and TASKS.md, then do exactly the task in docs/agent-prompts/M1a-auth-rbac.md (or M1b-catalog-devices.md). Commit after every working step and update HANDOFF.md.

## 4. When an agent hits its usage limit
Open the other agent in the **same worktree** and paste the prompt in `docs/agent-prompts/resume.md`. Nothing is lost because work is committed in small steps.

## 5. Finish a task
```
git push -u origin feat/auth-rbac
```
Open a pull request on GitHub, wait for the CI check to turn green, then merge. Delete the worktree with `git worktree remove ../osd-auth`.

## Safety
- Agents run commands on your computer. Keep approval prompts on, and read what they ask to run.
- Never give an agent the server PC's `.env`, real customer data, or production passwords.
- Never commit `.env` (it is in `.gitignore`).
