# Rubric: 11.1 — Build a parallel system. Prove isolation held.

Every criterion is **observable** — checkable without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | At least three writers each produced a commit of their own | `git log --oneline --graph --all` shows three branches diverging from `main`, each with at least one commit. |
| 2 | Each branch contains that writer's real work, not an empty commit | `git diff main...<branch>` is non-empty and touches the files that writer was assigned. |
| 3 | `runs.md` names, per writer, the mechanism, worktree path, branch, and commit | The paths appear in `git worktree list` and the hashes in `git log`. |
| 4 | One would-be collision is shown, with the layer that prevented it named | `collision.md` points at a path two writers could have shared and names a mechanism (worktree, or disjoint ownership) — not "the prompt said so". |
| 5 | One command the isolation checks do not stop is demonstrated | Evidence shows a shell write into the main checkout without git (a `cp` or redirect) succeeding, with the explanation that permissions/sandboxing govern it. |
| 6 | `NOTES.md` names the trade-off explicitly | Read it. It states what you chose and what it cost. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | Refusal messages are captured verbatim, not paraphrased | You are treating the harness as the source of truth. |
| 8 | Worktree lifecycle is deliberate — removed, or kept with a reason | You understand cleanup is a decision, not an accident. |
| 9 | The gap is described accurately, not as "the harness is broken" | Calibrated trust in isolation, which is the whole lesson. |
| 10 | A hook or tool-pool guard is suggested as the fix for a request-based rule | You know enforcement beats prose. |

---

## proof of understanding

The learner can answer these **without the code open**:

1. One of your writers finished with a perfect worktree but no commit. What did
   you have, and what did you not have?
2. A teammate says "isolation held — the agents didn't touch each other's files."
   Which layer actually guaranteed that, and what would have happened without it?
3. When would you **not** isolate, and what would you do instead?

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Grading notes

- A green run is not Criterion 1. If every branch points at `main`, the run is a
  failure no matter how clean the agents looked.
- Criterion 4 is the one that separates "I isolated" from "I know what isolated
  me." An answer naming the prompt fails it; the layer must be a mechanism.
- Criterion 5 exists to prevent overclaiming. A learner who insists the checks
  stop everything has not learned the boundary.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the brief was wrong and the learner said so, that's a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
