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

## 3. Work with one agent at a time (default)
Do the tasks in this order: **M1a** (login and permissions), then **M1b** (catalog, devices, import). M1b uses the permission checks that M1a creates.

Start a task (PowerShell, in the repo folder):
```
git checkout main
git pull
git checkout -b feat/auth-rbac
claude          # or: codex
```
Paste to the agent:
> Read AGENTS.md, HANDOFF.md and TASKS.md, then do exactly the task in docs/agent-prompts/M1a-auth-rbac.md. Commit after every working step and update HANDOFF.md.

Work in the same folder, with the same `.env` and the same dev database. Only one agent should be open in the folder at a time.

## 4. When an agent hits its usage limit
Close it, stay in the **same folder and branch**, and open the other agent (`codex` or `claude`). Paste the prompt in `docs/agent-prompts/resume.md`. Anything not yet committed stays in the folder, and the resume prompt tells the new agent to check `git status` first.

## 5. Finish a task
```
pnpm check
git push -u origin feat/auth-rbac
```
Open a pull request on GitHub, wait for the CI check to turn green, merge it, then:
```
git checkout main
git pull
git checkout -b feat/catalog-devices
```
and start the next task (`docs/agent-prompts/M1b-catalog-devices.md`) the same way. After each merge, paste the agent's `HANDOFF.md` to Claude in the chat for a review against the architecture rules.

## Safety
- Agents run commands on your computer. Keep approval prompts on, and read what they ask to run.
- Never give an agent the server PC's `.env`, real customer data, or production passwords.
- Never commit `.env` (it is in `.gitignore`).

## Optional: two agents at the same time (one worktree each)
Each agent gets its own folder and branch so they never overwrite each other.
```
git worktree add ../osd-auth    -b feat/auth-rbac
git worktree add ../osd-catalog -b feat/catalog-devices
```
For each worktree folder (PowerShell, example for `osd-auth`; use `optier_catalog` and port 3002 for the other):
```
cd ..\osd-auth
Copy-Item ..\optier-support-desk\.env .env
docker compose -f docker-compose.dev.yml exec db createdb -U optier_owner optier_auth
(Get-Content .env) -replace '/optier$','/optier_auth' -replace '^PORT=3000','PORT=3001' | Set-Content .env
pnpm install
pnpm --filter @optier/shared build
pnpm db:migrate
```
This gives the worktree its own database (so migrations never clash) and its own API port. The web dev server reads the port from the same `.env`, so `pnpm dev` in each folder talks to its own API (the web app takes the next free port, 5174 and so on).

Start an agent inside the folder (`claude` or `codex`) and paste:
> Read AGENTS.md, HANDOFF.md and TASKS.md, then do exactly the task in docs/agent-prompts/M1a-auth-rbac.md (or M1b-catalog-devices.md). Commit after every working step and update HANDOFF.md.

### If an agent hits its usage limit (parallel setup)
Open the other agent in the **same worktree** and paste the prompt in `docs/agent-prompts/resume.md`. Nothing is lost because work is committed in small steps.

### Finish a task (parallel setup)
```
git push -u origin feat/auth-rbac
```
Open a pull request on GitHub, wait for the CI check to turn green, then merge. Delete the worktree with `git worktree remove ../osd-auth`.
