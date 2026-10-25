# Rubric: 10.1 — Write a CLAUDE.md that changes behavior. Prove it.

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `CLAUDE.md` exists and is under 200 lines | Count the lines. Over 200 fails. |
| 2 | The file loaded in a fresh session | `/context` output in `NOTES.md` lists it under **Memory files**. |
| 3 | `before.md` and `after.md` exist and use the same task prompt | Read both. The prompt is identical; only the presence of `CLAUDE.md` differs. |
| 4 | The two sessions behaved differently, and the difference is named | `NOTES.md` points at the specific instruction and the observable change it produced. |
| 5 | Every instruction passes the "earn its place" test | `NOTES.md` marks each line "derivable?" and "default already?" — at least one is a clear "no" on both. |
| 6 | At least one instruction is concrete enough to check | It names a command or an exact format, not an adjective. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | `NOTES.md` names the trade-off explicitly | You understood, not just copied |
| 8 | Instructions are grouped under headers, not dense paragraphs | You know how the file is read |
| 9 | A folder-specific instruction was moved out to a rule | You know rules exist and when to use them |
| 10 | The file was checked for contradictions with a second memory file | `/doctor prompt-audit` or a manual read; you know files don't override each other |

## proof of understanding

Answered **without the file open**:

1. Your `CLAUDE.md` is listed in `/context`, but a fresh session ignores one rule. Name three possible causes and how you would tell them apart.
2. Adding a rule a second time to a long `CLAUDE.md` usually doesn't fix adherence. Why not?
3. When would you deliberately *not* put an instruction in `CLAUDE.md`?

If they're answered from memory, ask again with a new situation. Fluency isn't learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- Criterion 4 is the one people fudge. If the two transcripts are the same where they should differ, it fails — regardless of how good the file reads.
- If the brief was wrong and the learner said so, that's a **pass plus a finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
