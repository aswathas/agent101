# Rubric: 09.1 — Package your skill + subagent + hook as one installable plugin.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `claude plugin validate ./guardrail-kit` passes | Run it from the shell. `Validation passed`. |
| 2 | All three components exist in the plugin and nowhere in the installed originals | `ls` the plugin root: `skills/`, `agents/`, `hooks/hooks.json` (+ your script). |
| 3 | The plugin installs from a marketplace entry, not `--plugin-dir` | `claude plugin list` shows it with a scope, in a session started without the flag. |
| 4 | The clean-session test was run with the originals gone | `NOTES.md` shows the originals removed (or moved), and the three components still working after. |
| 5 | The hook blocks, and the output is from *this* plugin | Force push refused; hook's wording visible; `/plugin` → Installed names your plugin as the source. |
| 6 | The hook string exists in exactly one place on disk | `grep -r "<your hook command string>" ~/.claude/settings.json .claude/settings*.json` → no match. Record the command in NOTES.md. |
| 7 | Skill and agent carry the plugin-name prefix | `/guardrail-kit:<skill>` and `<plugin>:<agent>` both resolve; the bare names do not collide with anything. |
| 8 | Each of the three components is individually necessary | Remove any one; something breaks. State which you'd cut first and why. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 9 | `NOTES.md` names the trade-off explicitly | You understood, not just copied |
| 10 | `claude plugin details` was run on your own plugin | You know what you charge and which component pays it |
| 11 | Hook paths use exec form, or shell form with quoted `${CLAUDE_PLUGIN_ROOT}` | You know why a path with a space breaks it |
| 12 | No state written under `${CLAUDE_PLUGIN_ROOT}` | You know that directory moves on update |
| 13 | A teammate could install this without you | Someone else can read the repo and get a working install |

## proof of understanding

Answered **without the code open**:

1. A question requiring mechanism, not recall — e.g. why a hook in both
   `settings.json` and the plugin fires twice while a duplicated skill does not.
2. A question where the easy answer is wrong — e.g. "the plugin is installed
   twice" as the explanation for doubled hook output.
3. A "when would you NOT do this" question — e.g. when loose files in
   `~/.claude/` are the right answer and the plugin is packaging you don't need.

If they're answered from memory, ask again with a new situation.

---

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |