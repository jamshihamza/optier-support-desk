# Resume prompt (use when switching agents or continuing after a limit)

You are continuing work another coding agent started in this git worktree.

1. Read `AGENTS.md`, `HANDOFF.md`, `TASKS.md` and the task file named in `HANDOFF.md` (under `docs/agent-prompts/`).
2. Run `git status`, `git log --oneline -15` and `git diff` to see what is done and what is half-finished.
3. Run `pnpm check` (with `TEST_DATABASE_URL` set if available) to find the real state. Fix anything broken first.
4. Continue the unfinished steps of the task. Do not start new scope. Do not rewrite finished work unless it fails a test.
5. Commit after every working step. Before stopping, update `HANDOFF.md` (done, next, blockers, how to verify).
