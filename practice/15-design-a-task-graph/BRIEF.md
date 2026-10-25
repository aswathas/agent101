# Module: 15.1 — Decompose a real project. Find the critical path.

**Type:** Decide
**Phase:** 15
**Time:** ~90 minutes
**Prerequisites:** Lessons 98–105

---

## The task

Take a project you actually intend to do and decompose it into a task graph you
can defend: nodes whose outputs something consumes, every edge labelled blocking
or soft, decision nodes with owners, joins named, and a failure policy per node.
Then **compute** the critical path and the widest wave with your own script, and
write down the one edge you would change to shorten the critical path — with the
before and after numbers.

The artifact is not the diagram. The diagram is the easy half. The artifact is the
set of commitments that make the diagram true, and the two numbers your script
prints from it. A graph you cannot defend is decoration, and a critical path you
asserted is a guess wearing a number.

> **Constraint:** every **blocking** edge must name the artifact that crosses it,
> and the critical path and widest wave must come from `node graph.mjs
> graph.json` — not from reading the diagram. If your script and your written
> numbers disagree, the written number is wrong. You may not add an edge "to be
> safe"; a blocking edge is a wave you are paying for.

---

## Why this isn't just a tutorial

The naive version is a task list with arrows drawn between anything that feels
ordered. It looks like a graph, it computes nothing, and it usually has a widest
wave of one — a line with decoration. Tutorials stop there, because a pretty
diagram is a fine screenshot.

The constraint above forces you past it. If every blocking edge has to name an
artifact, you cannot keep an arrow you cannot justify — and half of them fall
away, which is where the parallelism appears. If the numbers must come from the
script, you cannot round your critical path down to the one you hoped for. And if
a same-wave write collision has to be resolved by name, the graph stops being a
drawing and starts being a plan.

And the ending is a `Decide`, not a Build. A graph that runs proves nothing about
whether it was *right*. The question is whether you can walk a stranger from the
nodes to the critical path and defend every edge between them — including the one
you chose to leave long.

---

## The constraint, stated properly

- **What breaks:** you draw arrows by feel, the graph serialises into a line, and
  you spend agents to run work that was always going to run one at a time. Or two
  nodes in one wave both write `config.json` and nothing warned you. Or three
  builders each guess an unresolved decision and their outputs cannot combine.
- **How you'll know:** `graph.mjs` prints a widest wave of 1 on a 15-node project
  (you over-blocked), prints a `COLLISION` line, or prints a critical path you
  cannot trace by hand on your own diagram.
- **What it costs you:** an afternoon of agents that serialise; a merge conflict
  the graph created; or a rewrite when the three guesses diverge at the fan-in.

## Method

1. **Scope.** A real project, 10–20 nodes, that you would run. Name its single
   final deliverable.
2. **Nodes as outputs.** One line per output, no verbs. If a node cannot be
   checked off by looking at an artifact, rewrite it.
3. **Edges, labelled.** For each pair, ask "can B produce correct output without
   A?" No → blocking; yes → soft. Soft edges must state what B does without A, or
   they are deleted.
4. **Decisions.** Promote every shared unresolved question to a node with an owner
   and a consumer list. At least one is required; the point is to make an invisible
   blocker visible.
5. **Joins.** Every multi-parent node names its join — all-of, any-of, or quorum —
   and says what a missing child does.
6. **Failure policy.** Per node: what fails it, whether it retries (and whether it
   is idempotent), and fail-open or fail-closed. Irreversible nodes fail closed.
7. **Compute.** Write `graph.mjs` (Lesson 105 has a working skeleton). It prints
   the critical path, the widest wave, and any same-wave write collisions.
8. **Defend.** In `GRAPH.md`, paste the script output, trace the critical path on
   the diagram, and name the one edge you would convert or delete to drop exactly
   one wave — with the cost of doing so.

## What to submit

Put your work in `attempts/`:

```
attempts/
├── NOTES.md            what you did, what surprised you, the trade-off you made
├── GRAPH.md            diagram, node table (writes + failure policy), edge table,
│                       joins, the script's numbers, and the one-edge change
├── graph.json          the graph as data
├── graph.mjs           your computation
└── evidence/
    ├── run.txt         the verbatim output of `node graph.mjs graph.json`
    └── shorten.md      before/after numbers for the one edge you changed
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading.

---

## Rules

- Work in this repo. Commit as you go (`CLAUDE.md` has the conventions).
- If you get stuck, say where. A documented dead end beats a silent struggle.
- If something doesn't work as this brief describes, **the brief may be wrong**.
  Write down what actually happened — that's a finding, not a failure.
- Do not pad the graph with nodes to look busier. A defended 12-node graph beats a
  hand-waved 30-node one.

---

## Done means

- [ ] `node graph.mjs graph.json` runs from a clean state and prints a critical
      path and a widest wave
- [ ] Every node names an output, and carries a `writes` list and a failure policy
- [ ] Every edge is labelled blocking or soft, and every blocking edge names the
      artifact it carries
- [ ] At least one decision node exists, with an owner and a consumer list
- [ ] Every multi-parent node names its join and its missing-child behaviour
- [ ] The busy-write check passes, or every collision is resolved and named
- [ ] The written critical path equals the script's, and traces on the diagram
- [ ] Exactly one edge change shortens the path by one wave, with before/after
      numbers and the cost stated
- [ ] `NOTES.md` states the trade-off you made and why

The last one is the real test: you can explain, without the files open, why a
particular edge is blocking and what it would cost to make it soft.
