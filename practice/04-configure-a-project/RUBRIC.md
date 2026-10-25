# Rubric: 04.1 — Configure a real project. Know which settings file won.

Every criterion is **observable** — checkable by opening a file or reading a
capture, without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | A scratch project exists under `attempts/project/` with `.claude/settings.json` and `.claude/settings.local.json`, each setting at least one key | Open both files; each has at least one settings key |
| 2 | At least one scalar key is set to different values in two layers | Grep the key in both files; the two values differ |
| 3 | At least one array key (e.g. `permissions.deny`) is set in two layers, and the session shows both entries live | Run the session; request both denied paths; both are refused — the list merged, it did not replace |
| 4 | A deny rule refuses a read of a named secret path | A capture shows the tool declining to read e.g. `.env`, with the path named in the message |
| 5 | Removing the winning layer changes the observed behavior | A before/after capture: same request, different result, with the file change shown in between |
| 6 | `RESOLUTION.md` gives, per colliding key, the layers that set it, the winner, merge-or-replace, and the observation | Read the table; no cell reads "probably" or "should be" |
| 7 | No edit to the real user settings file | `git status` shows no change under your home config; the extra layer lives in `overrides/` |

## should

| # | Criterion | What it signals |
|---|---|---|
| 8 | `NOTES.md` names the trade-off explicitly — which rules you kept personal vs shared, and why | You understood the layer choice, not just the syntax |
| 9 | The array-merge vs scalar-replace rule is restated with the learner's own example | You can generalise the rule, not just cite it |

## proof of understanding

The learner can answer these **without the files open**:

1. A setting you expect is not taking effect. Name the first three places you check,
   in order, and what each would tell you.
2. You set `permissions.deny` in the project-shared file and it merged with your
   user file instead of replacing it. Why did it merge, and what would you have to
   change to fully replace what the user layer set?
3. When would you NOT put a rule in the project-shared file? (The easy answer —
   "never" or "always" — is wrong.)
4. A session reports a value that does not match the file you edited. Walk the
   precedence list and describe how you would find the layer that won.

If they're answered from memory without naming the mechanism, ask again with a
different key or a different pair of layers. Fluency isn't learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the learner edited the real user file because the brief implied it was fine,
  that's a brief bug: note it, fix the brief, and pass the work if criteria 1–6 hold.
- If the brief was wrong and the learner said so, that's a **pass plus a finding**.
  Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
