# Rubric: 16.1 — Reproduce the empty-branch bug. Then prevent it.

Every criterion is **observable** — checkable by looking, without asking
permission. A module passes when every `must` is met. `should` is where craft
shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `attempts/NOTES.md` exists and names the exact commands used | Read it; the commands are specific, not "I made a worktree" |
| 2 | Evidence shows an empty branch with a dirty folder | `evidence.md` shows `git log --oneline main..<branch>` **empty** and `git -C <worktree> status --porcelain` **non-empty**, pasted as output |
| 3 | The worktree was removed and the uncommitted work is gone | Evidence shows the folder missing afterwards, or the removal command refusing/forcing |
| 4 | A prevention artifact exists in the repo and is committed | Point at the file; `git ls-files` lists it |
| 5 | The prevention fires on a dirty worktree | Run or trigger it against the reproduction; it refuses or exits non-zero |
| 6 | The prevention stays quiet on a committed worktree | Run or trigger it against the committed re-run; it passes |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | `NOTES.md` names the trade-off explicitly (e.g. WIP-commit cost vs checkpoint frequency) | You understood, not just copied |
| 8 | The prevention runs without being remembered — a hook or a check the workflow calls | You closed the silent failure instead of re-arming it |
| 9 | The prevention inspects the *worktree* (uncommitted or unpushed), not just whether a branch exists | You targeted the real signature, not a proxy |

## proof of understanding

Answered **without the code open**:

1. A worktree branch shows no commits of its own, yet the folder is full of
   edits. Where do those edits live, and which two commands show the branch is
   empty while the folder is not?
2. Two agents finish: one committed before its worktree was removed, one did not.
   Which work does `git worktree remove --force` destroy, and why can `git
   reflog` not bring it back?
3. When would isolation *without* committing a worktree actually be acceptable?
   (Consider a deliberately throwaway experiment, or a read-only investigation.)

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- Criterion 5 is the one people fake. A prompt that says "remember to commit" is
  a request, not a check. Ask to see it refuse a dirty worktree.
- If the brief was wrong and the learner said so, that's a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
