# Rubric: 03.1 — Route a real workload across model tiers. Find where the frontier model was wasted.

Every criterion is **observable** — checkable by looking at the artifact, without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | The inventory lists every call the workload makes | Compare the inventory row count against the call sites in the script or loop; a sample is not an inventory |
| 2 | Every call carries an output shape, D or G | Scan the shape column for blanks or hedges; each row is one or the other |
| 3 | Every call carries a cost, measured or honestly estimated | The cost column has a number per row, and the method is stated once |
| 4 | A twenty-example check set exists with known good answers | The file is present, has twenty inputs and their correct outputs, and is held out of any tuning |
| 5 | The check set was run under the old routing and the new one | Two result sets over the same twenty inputs, dated or labelled |
| 6 | The re-routing keeps every check-set result, or names the one it drops and why | `routing.md` or `NOTES.md` accounts for any result that changed |
| 7 | At least one call stays on a larger model, with a stated reason | The reason cites task shape, volume, privacy, or error cost — not "it felt safer" |
| 8 | The cost difference between old and new routing is a number | The arithmetic appears, and it uses the learner's real volume |

## should

| # | Criterion | What it signals |
|---|---|---|
| 9 | `NOTES.md` names the single call where the frontier was most wasted | They found the point of the exercise, not just a cheaper config |
| 10 | `NOTES.md` names the trade-off accepted, in one sentence | They chose rather than reached for the cheapest option wholesale |
| 11 | The plan cites a mechanism from the lessons — output tokens, prefix caching, or effort | The change is understood, not copied |

---

## proof of understanding

Answered **without the code open**:

1. Why was the most expensive call in your workload probably not the hardest one?
2. Your routing got the workload 40% cheaper by moving every call to a small model. Why might that be a failure rather than a win?
3. When would you **not** route a decision down to a tiny local model?

If they are answered from memory, ask again with a new situation. Fluency is not learning.

---

## Grading notes

- A rubric that cannot be checked by looking is a rubric that cannot be graded. Every row above names the file or the number to look at.
- Partial passes: say which criteria passed and which did not. Do not round up.
- An honest estimate with a stated method passes criterion 3. A blank cost does not.
- If the brief was wrong for their workload and they said so, that is a **pass plus a finding**. Write the finding down; the brief needs fixing.
- The check set is the spine of this module. A great routing plan with no before/after measurement is not a pass — that is exactly the failure the constraint exists to catch.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
