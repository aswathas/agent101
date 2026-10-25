# Rubric: 08.1 — Write a hook that makes an unsafe action *impossible*.

Every criterion is **observable** — checkable without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | The artifact exists and runs from a clean state | Fresh shell, run `node selftest.mjs`. It executes and exits 0. |
| 2 | The hook is on a blocking event, before the action | Read `settings.json`. The event is `PreToolUse` (or another event the docs list as blocking). A `PostToolUse` guardrail is an automatic fail — it cannot refuse. |
| 3 | The unsafe action is genuinely refused, live | The learner asked the agent for the action and it did not happen; the world shows no effect. Ask for it yourself and confirm. A refusal printed after the action is not this. |
| 4 | The refusal reason is the script's own stderr | The reason shown in the session is the first line the script wrote to **stderr** on `exit 2`. If it came from stdout, or is empty, criterion 4 fails. |
| 5 | `selftest.mjs` asserts exit codes and runs without Claude Code | Read it: it spawns/pipes fabricated events into the script and compares `$?`/`status`. It must include at least one **allow** (expected 0) case, not only block cases. `git push`-only tests fail this. |
| 6 | The near-miss safe neighbour is not blocked | `evidence/safe-neighbour.md` shows the adjacent safe command (`git status`, `--force-with-lease`, a write outside `dist/`, a single-path delete) running after the hook is live. |
| 7 | The failure mode was broken on purpose and observed | `evidence/fail-mode.md` records the change made, the exit code that resulted, and whether it failed open or closed. "I assume it would fail open" is not an observation. |
| 8 | The failure mode matches the written choice | The script or `NOTES.md` states fail-open or fail-closed, and the observation in criterion 7 agrees with it. A stated choice contradicted by the behaviour is a fail. |
| 9 | The three escalating attempts are recorded verbatim and all refused | `evidence/refusals.md` shows the plain ask, the ask-with-a-reason, and the ask with "and also" appended, and what came back. A prediction is not evidence. |
| 10 | `NOTES.md` states a specific trade-off | It names what the hook blocks, what it deliberately leaves alone, and the alternative it rejected. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 11 | Policy is data, not branches | Blocked patterns live in an array; a new rule is a new line. Read the script — three `if (cmd.includes(...))` blocks in a row is the shape this module exists to replace. |
| 12 | A short explicit `timeout` is set | The handler declares `timeout` well under the 600s default, justified by what the script actually costs. |
| 13 | One script serves every event it needs | `Bash` and `Edit\|Write` are handled by the same file, branching on `hook_event_name`/`tool_name` rather than copy-pasted into two. |
| 14 | Optional fields are guarded | `?? ''` or `// empty` appears wherever a field is absent on some events. Non-Bash events must not crash the script. |
| 15 | The self-test earns its keep on a real bug | `NOTES.md` names a rule-ordering or false-positive bug the test caught before it shipped (for example, a broad rule swallowing a safe variant), rather than listing only pass results. |

---

## proof of understanding

Answered **without the code open**:

1. A question requiring mechanism, not recall. *Your hook refused a force-push.
   Walk me from the model emitting the `Bash` tool call to the action being
   unreachable.* The answer ends at the blocking event and `exit 2` firing
   before the tool runs — not "the hook said no".
2. A question where the easy answer is wrong. *You move the same script from
   `PreToolUse` to `PostToolUse` and the file is still written. Is the hook
   broken?* The easy answer is "yes, the script is wrong". The right one is that
   nothing is wrong with the script — it is on the wrong seam, and exit 2 there
   only hands stderr to the model.
3. A "when would you NOT do this" question. *When is a guardrail hook the wrong
   tool — and what would you use instead?* The good answer names a case needing
   judgement a regex can't make, or a one-off action where the fail-closed lockout
   costs more than the risk; it says what replaces it (an instruction, a
   permission rule, an `agent` handler) and accepts the weaker guarantee.

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Honest failure

A module can fail and still teach. These are failures with a finding attached,
not silent ones:

- **It blocked, but not before the action.** The hook was on `PostToolUse` or
  used `exit 1`. That is the exact trap this phase is about. Write it down, fix
  the seam, and note that the script was never the problem.
- **It blocked the safe neighbour too.** You have a false positive. That is not a
  stricter guardrail; it is one your team will bypass. Record the command that got
  caught and narrow the pattern.
- **You couldn't break it on purpose.** Then you don't yet know its failure mode.
  Remove the guard on a field, feed it malformed input, and watch the exit code —
  "it hasn't broken yet" is not a failure mode.
- **The live refusal never fired even though the self-test passed.** Classic
  wiring: settings not reloaded, matcher wrong, or a merged settings file you
  forgot. This is the Lesson 60 order applied for real; write down which step
  found it.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
  Criterion 3 is checked by asking for the action and looking at the world, not by
  reading the learner's prose about it.
- Screen messages are not effects. A refusal reason with the action still having
  happened is criterion 3 failing, however convincing the message.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the brief was wrong and the learner said so, that's a **pass plus a finding**.
  Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
