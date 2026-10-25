# Rubric: 12.1 — Write a workflow with propose → verify. Hit the completion-order trap *on purpose*.

Every criterion is **observable** — checkable without asking permission. `must`
is the bar; `should` is where craft shows.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `attempts/workflows/propose-verify-naive.js` and `propose-verify-fixed.js` both exist and both run from a clean state | Run each one. Both complete, or fail only in the documented way |
| 2 | Each script's first statement is `export const meta` with `name` and `description`, and every proposal carries a unique marker that its verifier echoes back | Read the two files. Find the marker in the proposal and the echo in the verifier's output |
| 3 | `attempts/evidence/run-with-loss.txt` shows a run in which at least one second-fan-out agent was lost, and the naive join printed at least one line pairing a verdict with the wrong proposal | Grep the evidence for a line where the verdict's echoed marker differs from the proposal printed beside it. The run must also show the loss, or a `null`/`MISSING`, so the cause is visible |
| 4 | `propose-verify-fixed.js` binds each result to its input before any filtering, and its evidence file contains no mislabelled line on the same case — the lost proposal is marked explicitly instead | Compare `run-fixed.txt` line by line against the proposal list. Every verdict's marker matches the proposal it is printed beside, and one line names the lost proposal |
| 5 | `NOTES.md` names the exact line or expression where the two joins diverge, and states the trade-off the fix makes | Quote it. "`.filter(Boolean)` then `results[i]`" or equivalent, plus one sentence on what the fix costs |

If criterion 3 cannot be satisfied because no loss could be forced, that is not an
automatic fail: the submission passes 3 only if `NOTES.md` states that the loss
could not be forced *and* names the shortest path to forcing one. A blank is a
fail.

## should

| # | Criterion | What it signals |
|---|---|---|
| 6 | The output distinguishes three states: a verdict, an empty verdict, and a lost agent | You know that absence and emptiness are different facts |
| 7 | `NOTES.md` states which agents reran after the loss and whether that matched what the learner observed | They checked the resume rules against reality rather than trusting prose |
| 8 | The two scripts are kept side by side and are otherwise identical, so the diff is the join and nothing else | The experiment isolates one variable |

## proof of understanding

Answered **without the code open**:

1. In the fixed script, what is the identity of a verdict, and where does that
   identity come from?
2. If you had used `parallel()` instead of `pipeline()` for the second fan-out,
   which parts of the join would change — and which parts would not?
3. When would adding a verifier make a result *worse* rather than more
   trustworthy?

If they are answered from memory, ask again with a new situation — a different
fan-out, a different loss position.

## Grading notes

- A solution that prevents the loss instead of surviving it does not meet
  criterion 4. Losing an agent is not a bug to be eliminated; it is a case to be
  handled.
- A fix that drops the lost entry but keeps the reports readable (for example by
  binding the input name first) passes. The requirement is that no verdict is
  ever paired with the wrong input, not that every input has a verdict.
- If a run happens to mislabel nothing because the lost agent was last, that is
  luck, not a pass. Criterion 3 needs a loss that *shifts* something.
- If the brief was wrong and the learner said so, that is a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
