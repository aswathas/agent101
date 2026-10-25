# Rubric: 06.1 — Write a subagent that does one job perfectly and refuses everything else.

Every criterion is **observable** — checkable without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | The agent file exists and the checker reports zero errors | `node phases/06-subagents/47-author-a-subagent/code/check-subagent.mjs <your-file>` |
| 2 | The job works on real input | Run it on a real file from your project. Output is the thing you asked for. |
| 3 | The `description` names a trigger, not a capability | Read it. Could Claude route on it? "Use proactively after X" or a named situation — not "A helpful agent". |
| 4 | At least three out-of-scope requests are declined, one with "and also" appended | `checks.md` shows the requests and what came back, verbatim. |
| 5 | You can name which layer enforced the refusal, with evidence | You removed a layer and re-ran: e.g. body-refusal-only wavered, tool-pool removed declined. |
| 6 | The tool pool is narrower than the default where the job allows | The `tools`/`disallowedTools` line is present and justified in `NOTES.md`. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 7 | The body separates what it does from what it refuses | You wrote both halves. Most people write one. |
| 8 | The refusal names the boundary instead of apologising | "I only triage report files" beats "Sorry, I can't do that." |
| 9 | `NOTES.md` names the trade-off explicitly | You understood, not just copied |
| 10 | The agent is committed in a shared location | `.claude/agents/` rather than somewhere only you can reach |

---

## proof of understanding

The learner can answer these **without the code open**:

1. A request arrives that is *almost* your agent's job. What does your agent do,
   and which layer decided that?
2. You wrote a refusal section into the body and it's 40 lines long. Name one
   request that could still talk past it, and what would actually stop it.
3. When would you **not** write a subagent for this — and what would you write
   instead?

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
  Criterion 4 requires verbatim output, not "it refused when I asked."
- A long refusal body is not evidence of a narrow agent. Criterion 5 is the one
  that separates them — if the learner can't say which layer did the work, they
  don't know what they built.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the brief was wrong and the learner said so, that's a **pass plus a finding**.
  Write the finding down; the brief needs fixing.

---

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |