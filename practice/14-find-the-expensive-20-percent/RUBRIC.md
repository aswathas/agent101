# Rubric: 14.1 — Instrument a real loop. Find the 20% of calls costing 80%.

Every criterion is **observable** — checkable without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `attempts/ledger.md` exists with one row per distinct call, with columns: call id, purpose, D/G, input tokens, output tokens, count, est. cost, output used Y/N | Open the file; every column is present and every loop call has a row |
| 2 | The loop is real and names its source in `NOTES.md` (a Phase 12 workflow, a Claude Code session, or the Lesson 97 harness), with at least ten total model calls | `NOTES.md` names the source; summing the `count` column gives ≥10 |
| 3 | The expensive set is stated: the smallest set of calls summing to ≥80% of total estimated cost, with the call count and the share | Recompute from `ledger.md`; the stated set and share match within rounding |
| 4 | Every call in the expensive set is labelled decision or generation, and each decision call names its closed set of outputs | `finding.md`; each decision row lists its legal outputs |
| 5 | At least one recommendation is grounded in a named ledger row and is one of: move a decision call to a cheaper tier, cut a call whose output was unused, or reduce a call's frequency | `finding.md` cites the row id and names the recommendation type |
| 6 | The cost method is stated and dated: the model alias used, the price per million tokens, and the date looked up | `NOTES.md` states alias + price + date; a reader can reproduce the estimate |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | `NOTES.md` names a call that was cheap per token but expensive in aggregate | You measured the system, not the single call |
| 8 | The ledger distinguishes measured token counts from estimated ones | You know which numbers are hard and which are guesses |

## proof of understanding

Answered **without the ledger open**:

1. Why does sorting by per-call cost point at the wrong call? (mechanism)
2. A decision call costs $0.0002 and runs 100,000 times; a generation call costs
   $0.05 and runs 50 times. Which do you target first, and why? (easy answer
   wrong)
3. When would you NOT split a decision out to a cheaper model? (when not to)

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the brief was wrong and the learner said so, that's a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
