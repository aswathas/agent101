# Rubric: 05.1 — Author a skill. Use it. Break it. Fix the frontmatter.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | The skill runs from a clean session | Start a fresh session, type `/<name>`. It does the thing. |
| 2 | The skill fires without the slash | In a fresh session, ask for the task in plain words. It loads. |
| 3 | Three or more breakages are recorded, each with symptom, cause and fix | `evidence.md`. Each cause is a mechanism, not a guess. |
| 4 | At least one breakage was identified by reading a debug log, not by editing | `evidence.md` names the log line or command output that gave it away. |
| 5 | Every breakage is reproduced from the working skill, then restored | `broken/` plus a final run of the restored skill. |
| 6 | `check-frontmatter.mjs` exits 0 on the final skill | `node …/check-frontmatter.mjs <your-skill-dir>` |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | The `description` contains words a stranger would type | You wrote a match rule, not a summary |
| 8 | The body uses standing instructions, not one-time steps | You know the content isn't re-read on later turns |
| 9 | At least one supporting file, loaded only on demand | You understand the body/supports split |
| 10 | Anything with side effects is cell 2 (`disable-model-invocation: true`) | You applied the invocation matrix |
| 11 | `NOTES.md` names the trade-off explicitly | You understood, not just copied |

## proof of understanding

Answered **without the file open**:

1. A question requiring mechanism, not recall — e.g. "your skill is in the menu
   but never fires; what are the two causes and how do you tell them apart?"
2. A question where the easy answer is wrong — e.g. "should you add more trigger
   phrases to the description, and what would make that the wrong call?"
3. A "when would you NOT do this" question — e.g. "when is `user-invocable:
   false` the wrong choice?"

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- Breakages that don't reproduce don't count. "I think it stopped firing" is not
  evidence.
- If the brief was wrong and the learner said so, that's a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |