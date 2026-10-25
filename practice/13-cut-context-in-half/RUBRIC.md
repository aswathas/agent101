# Rubric: 13.1 — Cut a bloated context by half. Prove capability survived.

How this attempt is judged. Every criterion is **observable** — something a
grader can check without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `before.md` and `after.md` measure the same repo the same way, and the standing cost dropped by at least 50% | Compute the ratio from the two captures; both files name the exact commands used |
| 2 | `architecture.md` gives every changed fact a home: `Delete (derivable)`, `Skill`, `Path rule`, `Subagent`, or `references/` | Read the table. Every row has a home and a "why"; a `Delete` row states where the repo already says the same thing |
| 3 | A capability test exists, is named, and requires at least one relocated fact | `capability-test.md` names the task and shows a fresh-session transcript where the relocated fact loads on demand |
| 4 | The capability test passes against the reduced setup | Run the task from a fresh session as described. It completes. |
| 5 | At least one fact that would fail the capability test if deleted is shown relocated, not deleted | Cross-check `architecture.md` against the test: the needed fact has a non-`Delete` home, and the transcript shows it loading |

## should

| # | Criterion | What it signals |
|---|---|---|
| 6 | `NOTES.md` names the trade-off explicitly — what got slower, what now needs a step, what a teammate must remember | You understood, not just measured |
| 7 | The reduction is reproducible: commands and conditions are recorded so the grader gets a similar number | You treated this as an instrument, not a one-off |
| 8 | The architecture table reflects the four questions — home, lifetime, trigger, eviction — not "keep, because important" | You designed the context instead of trimming it |

## proof of understanding

The learner can answer these **without the code open**:

1. Which fact was most tempting to leave in `CLAUDE.md`, and which of the four
   architecture questions ruled that home out?
2. Your window shrank, but the capability test now takes an extra step (a skill
   to invoke, a file to read). How do you know that is relocation and not
   capability loss?
3. When would you refuse to cut, even with a full window — what kind of fact must
   stay at startup?

If they are answered from memory, ask again with a new situation. Fluency is not
learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
  Every criterion above points at a file or a run.
- Partial passes: say which criteria passed and which did not. Do not round up.
- A 50% cut with a failed capability test is a **fail**, not a partial — the
  constraint was "lose nothing". Report the failure; it is the lesson.
- If the brief was wrong and the learner said so, that is a **pass plus a
  finding**. Write the finding down; the brief may need fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
