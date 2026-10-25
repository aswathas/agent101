# Rubric: 07.1 — Build an MCP server. Then ask: would you trust a repo you cloned?

Every criterion is **observable** — checkable without asking permission.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | The server runs from a clean state | Fresh shell, run it. It starts and answers `initialize` and `tools/list`. |
| 2 | `test-server.mjs` asserts on real replies | Read it. If it spawns the server and checks returned JSON, it counts. A test that only imports functions and never speaks the protocol does not. |
| 3 | `.mcp.json` is committed and holds no secret | `git log -p -- .mcp.json | grep -iE "key|token|secret|bearer|password"` returns nothing but variable *names*. Literal values are a fail. |
| 4 | It works from a fresh clone in a fresh directory | Clone elsewhere, follow your own `NOTES.md` steps. If it needs a step you didn't write down, criterion 4 fails. |
| 5 | The hostile input was actually run, and the outcome is written down verbatim | `evidence/injection-run.md` contains what the agent said. A prediction is not evidence. |
| 6 | All six decision questions are answered, and #3 names a concrete scope | "A token" is not a scope. "Read-only on repo X, no write, no admin endpoints" is. |
| 7 | `NOTES.md` states the trade-off you made | A specific trade-off, with the alternative you rejected and why. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 8 | Tool descriptions put the searchable words first | You understood that with tool search on, the description *is* the discovery surface — the part Lesson 54 is about |
| 9 | Tool failures come back as `isError` content, not exceptions | The loop stays useful after a failure. A crash teaches nothing |
| 10 | The self-check covers a failure case, not just the happy path | An unknown tool, a bad argument, a missing field. Happy-path-only tests don't catch protocol bugs |
| 11 | You measured something — context cost, call count, time | You treated the server as something you can make worse, not just something that runs |
| 12 | Question 6 distinguishes your repo from a stranger's by something specific | "I'd read it more carefully" is not specific. "The stdio command writes only to `.cache/`, and I'd diff that against Lesson 52's read-only shape" is |

## proof of understanding

Answered **without the code open**:

1. A question requiring mechanism, not recall. *Your `.mcp.json` uses
   `${API_KEY}`. Walk me from the file on disk to the value your server
   actually received.* The answer ends at load-time expansion, not "the
   environment provides it".
2. A question where the easy answer is wrong. *You clone a repo whose
   `.mcp.json` adds a stdio server, and it shows as pending approval. Is the
   server broken?* The easy answer is "the config must be malformed" or "it's
   fine, it'll load next time". The right one is that this is a human gate
   working as designed, and a repo cannot approve its own servers.
3. A "when would you NOT do this" question. *When would you use
   `local` scope instead of `project` for the same server — and what's the
   cost of that choice?* The good answer names a case where committing is
   itself the harm (a personal token, a local-only path, a server that runs
   on your machine only) and accepts that it can't be shared.

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Honest failure

A module can fail and still teach. These are failures with a finding attached,
not silent ones:

- **The agent complied with the injection.** Write it down. That's a real
  observation about a specific model on a specific day, and it's the strongest
  possible argument for least privilege over prompting. Do not rerun until it
  refuses and report only that.
- **The agent refused and you can't say why.** Then the lesson's honest
  position applies: a refusal you can't attribute to a structural control isn't
  a control. Ask what would happen if it hadn't refused.
- **`git log` turned up a secret.** You found it early, which is the point of
  the check. Fix it, and write down what you'd do differently — rotate first,
  commit second.
- **It didn't work in the fresh clone.** The most likely cause is a relative
  path or an absolute path pointing at your original checkout. That's a real
  finding about how stdio entries resolve, and it's worth the paragraph.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
  Criterion 3 is checked with a command, not by reading your prose about it.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the brief was wrong and the learner said so, that's a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |