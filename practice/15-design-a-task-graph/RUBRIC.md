# Rubric: 15.1 — Decompose a real project. Find the critical path.

Every criterion is **observable** — checkable without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `graph.mjs` runs from a clean state | Fresh shell: `node graph.mjs graph.json` exits 0 and prints a critical path and a widest wave. |
| 2 | Every node names an output, not an activity | Read the node table. Each row names something you could show someone. "Work on…" is a fail. |
| 3 | Every edge is labelled, and every blocking edge names its artifact | The edge table has a blocking/soft column and a reason column. A blocking edge with no named artifact is a fail. |
| 4 | Soft edges justify their own deletion | For each soft edge, the notes say what B does without A. "It reads nicer" with nothing else is a fail. |
| 5 | At least one decision node, with owner and consumers | The graph has a `kind: decision` node, a single owner, and a consumer list equal to the nodes that would otherwise guess. |
| 6 | Every multi-parent node names its join and missing-child policy | The join table names all-of / any-of / quorum and states what a missing child does. A silent drop is a fail. |
| 7 | Every node has a failure policy; irreversible nodes fail closed | The node table has `failsOn`, `retry`, and `onFinalFailure`. Every deploy / migrate / pay node reads `fail-closed`. |
| 8 | The critical path is the script's number, and it traces | Compare `evidence/run.txt` to `GRAPH.md`. Then trace the longest blocking chain on the diagram by hand; you must reach the same count. |
| 9 | The busy-write check passes, or collisions are resolved by name | `run.txt` shows no `COLLISION`, or each collision is resolved in the doc by an added edge or a stated claim. |
| 10 | Exactly one edge change shortens the path by one wave | `evidence/shorten.md` shows before/after numbers from the script, and names the cost of the change. |
| 11 | `NOTES.md` states the trade-off you made | A specific trade-off: the alternative you rejected and why. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 12 | The widest wave is compared against a real budget | You treated fan-out width as a cost, not a trophy. |
| 13 | The decision node is load-bearing | Removing it would send two or more consumers down divergent paths — the doc says which. |
| 14 | Same-wave independent writers use a claim | You connected the design to Lesson 101 instead of assuming a runner prevents collisions. |
| 15 | A forced failure was demonstrated | The evidence shows one node failing, its descendants tainted, and its siblings completing. |
| 16 | The one-edge change names a rejected alternative | "I converted X; I did not convert Y because the interface is untestable" is craft. |

## proof of understanding

Answered **without the files open**:

1. A question requiring mechanism, not recall. *Walk me from `graph.json` to your
   printed critical path. Which soft edge can you delete to raise the widest wave
   without changing the critical path, and why does it move one number and not the
   other?* The answer distinguishes width from depth.
2. A question where the easy answer is wrong. *Your widest wave is 4. A colleague
   says "great, launch 4 agents." What must already be true before that is safe?*
   The easy answer is "nothing, the graph says so". The right one names claims for
   any shared writer, plus independent context per node.
3. A "when would you NOT do this" question. *When would you deliberately leave a
   long blocking edge in place rather than convert it to an interface?* The good
   answer names a case where the interface cannot be validated and the
   reconciliation would cost more than the wait.

If they're answered from memory, ask again with a new situation. Fluency isn't
learning.

---

## Honest failure

A module can fail and still teach. These are failures with a finding attached:

- **The widest wave is 1.** The most likely cause is a graph that is a true
  pipeline — which is a finding, and a useful one. But check first whether you
  over-blocked: an edge you kept "to be safe" is the usual culprit.
- **`graph.mjs` throws `cycle:`.** Good — the check worked. Write down the cycle
  the script printed and the fix you chose (merge the nodes, or split an
  interface).
- **The script prints a `COLLISION`.** That is the graph-being-a-plan working.
  Resolve it by naming a claim or adding an edge, and record which you chose.
- **Your written critical path disagrees with the script.** The script wins. That
  disagreement is exactly what the constraint was for; write down which edge you
  miscounted.
- **No edge change shortens the path.** Possible for a true pipeline. Say so, and
  then show that the widest wave cannot rise either — that is a complete, honest
  result.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
  Criteria 1, 8, and 9 are checked by running one command, not by reading prose.
- Partial passes: say which criteria passed and which didn't. Don't round up.
- If the brief was wrong and the learner said so, that's a **pass plus a
  finding**. Write the finding down; the brief needs fixing.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
