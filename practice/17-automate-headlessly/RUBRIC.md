# Rubric: 17.1 — Automate a real task headlessly, end to end.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | One command runs the whole task from a clean checkout | Clone the repo, clear your user config (or run in a fresh container), run the command. It completes. |
| 2 | The run loads no host context it did not ask for | Grep the command for `--bare` (or an explicit `--settings` / `--mcp-config`); run it in a repo that has a `CLAUDE.md` and confirm the output does not change with and without that file. |
| 3 | Output is machine-readable, not screen-scraped prose | The command writes JSON (or a file with a fixed schema). Pipe it through `jq` or re-run and diff the shape; it parses every time. |
| 4 | A failed run fails the command | Feed bad input or a denied tool. The command exits non-zero and prints which step failed. |
| 5 | The run never waits for a human | Run it with stdin closed and no TTY. It terminates on its own within a normal timeout. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 6 | Two machines produce the same shape of output | You removed the machine from the equation, not just the obvious flags |
| 7 | `NOTES.md` names what `--bare` cost you and why that is acceptable | You understood the trade, not just copied a flag |
| 8 | The command is small enough to read in one sitting | Automation you can maintain, not a script you inherited |

## proof of understanding

Answered **without the code open**:

1. Why does the same `claude -p` command behave differently on your laptop and
   on a runner, and what exactly does `--bare` stop loading?
2. Your task genuinely needs a project skill, which `--bare` skips. Name your two
   options, and which you would pick and why.
3. When would you *not* use headless mode for this task — when is an interactive
   session the right tool?

If they're answered from memory, ask again with a new situation.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
