# Rubric: 18.1 — Ship it. End to end, with everything.

Every criterion is **observable** — checkable without asking permission.

A module passes when every `must` is met. `should` is where craft shows up.

---

## must

| # | Criterion | How to check |
|---|---|---|
| 1 | `SPEC.md` is checks only — each row a command and an expected result — and runs as one command | Run the command in the file. One exit code for the whole spec. |
| 2 | The spec failed before the work started | `evidence/verifier.txt` shows the spec red on the pre-change commit, and the failure is the check you predicted. |
| 3 | `GRAPH.md` gives every node its predecessors explicitly (named, or "none") and names the critical path | Read it. A node with a blank predecessor column fails. |
| 4 | At least two nodes were built in parallel, each in its own worktree, each with its own commit | `git worktree list` during the run; `evidence/branches.txt` shows one branch and one head sha per node. |
| 5 | Every node's commit is reachable from the merged branch | `git branch --contains <sha>` for each sha in `branches.txt` names the branch; `git log --graph --all --oneline` shows the merges. |
| 6 | No two simultaneously-built nodes touched the same file | For each parallel pair: intersect their `git diff --name-only <base>..<branch>` outputs. An intersection is a fail, not a judgement call. |
| 7 | The verifier passes on the **merged** branch from a clean clone, and leaves the tree clean | `evidence/clean-clone.txt`: clone, run one command, green. Then `git status` is clean. |
| 8 | One real failure is reported from committed evidence and placed in a Lesson 118 class | `NOTES.md` names the class, the command that revealed it, and the artifact in `evidence/` it came from. |
| 9 | `REVIEW.md` resolves the build's external claims with a URL and a date each | Every row has a state (documented / version-gated / unconfirmed / contradicted); no row says "probably". |
| 10 | The toolchain version is recorded with the result | `claude --version` output appears next to the verifier run it produced. |

## should

| # | Criterion | What it signals |
|---|---|---|
| 11 | The failure was found in cheapest-cause-first order | `NOTES.md` lists what was ruled out before the class was named. Blaming an agent first is the behaviour this module exists to break. |
| 12 | One spec check was added after a failure | The "missing check" sentence names the failure that added it. A spec that never grew means you predicted everything, which is unlikely. |
| 13 | One node was cut, folded, or serialized because it wasn't genuinely parallel | You found a false frontier before the merge did. Name the shared resource. |
| 14 | `DRIFT.md` exists and the surface rows carry URLs and dates | From Lesson 119. A ledger with no version column is a list, not an instrument. |
| 15 | A teammate could reproduce the result without you | They have the repo and the brief's one command, and nothing else. |

## proof of understanding

Answered **without the code open** and without reading `NOTES.md`:

1. Two nodes ran in parallel, both branches are green, and only one node's commit
   is reachable after cleanup. What happened, and which command catches it before
   the cleanup runs?
2. The merged branch is red and the suite was green on both nodes. Why is
   "find the guilty agent" the wrong first move, and what are you checking before
   you look at any diff?
3. Name a change that should never have become a graph, and say what the graph
   cost you that doing it by hand would not have.

If these are answered from memory or from the artifacts, ask again with the
artifact swapped for one that fails differently. Fluency isn't learning.

---

## Grading notes

- A rubric that can't be checked by looking is a rubric that can't be graded.
  Every `must` above is a command or a file.
- Partial passes: name which criteria passed and which didn't. Don't round up. A
  green verifier from a dirty working tree is criterion 7 unmet, not a soft pass.
- If the clean clone surfaced an assumption the brief didn't warn about, that's a
  **pass plus a finding**. Write the finding down; the brief needs fixing.
- Criterion 6 is the one learners argue about. "They touched different files" is
  not the claim — the claim is that no two *concurrent* nodes did, and the diff
  intersection settles it without opinion.
- Criterion 8 with a fabricated or uncommitted failure is a fail. A run that
  genuinely had no failure is a pass on 1–7 and an "incomplete" on 8 — say so
  plainly rather than inventing one.

## Attempt history

| Date | Outcome | Criteria met | Notes |
|---|---|---|---|
| | | | |
