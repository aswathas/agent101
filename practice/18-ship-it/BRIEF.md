# Module: 18.1 — Ship it. End to end, with everything.

**Type:** Build
**Phase:** 18
**Time:** ~2 hours
**Prerequisites:** Lessons 116–119, and every phase before them

---

## The task

Pick one real change you actually want — small enough to finish today, big enough
to be two to five nodes. Then run the whole method once, all the way through:
write the spec as runnable checks, draw the graph and name the blocking edges,
build the independent nodes with isolated agents, verify on the merged result,
and ship.

"Ship" has a definition here, and it is not "the branch is green on my machine."
It is: **the result is replayable by someone else, from the repository alone.**

> **Constraint:** a stranger clones the repo, runs exactly one command, and gets
> your result. No installed plugins, no global settings, no uncommitted file, no
> absolute path, no step that lives only in your head. If any part of the run
> depends on your machine's state, it is not shipped — it is a demo.

---

## Why this isn't just a tutorial

Every phase up to here handed you one tool and asked you to use it well. This is
the only module where you hold all of them at once and they compete. The graph
wants more nodes; the context window wants fewer. Parallelism wants agents now;
verification wants a stable interface first. Your plugin wants to be in the run;
the clean clone does not have it.

The naive path is comfortable and it passes a demo: build one piece yourself while
the agents run, "verify" by reading the diff, then ship whatever merged. Nothing
in that path is a lie — and it collapses the first time the result has to leave
your laptop, because twelve small assumptions never made it into the repo.

The clean-clone constraint is what converts the tutorial into a capstone. It is
also the least glamorous kind of work in the whole course, which is why it is the
last module.

---

## The constraint, stated properly

- **What breaks:** the clean-clone command fails on something invisible from
  inside your working copy — a settings key you set months ago, a plugin that
  provides a hook, a file you never `git add`ed, a script with your home directory
  hardcoded, a model alias you pinned to a version that only resolves on your
  account.
- **How you'll know:** clone to a fresh directory, run the one command, read the
  first error. Then fix it, delete the clone, and do it again — because the first
  fix usually reveals the second assumption.
- **What it costs you:** the hour between "works here" and "works there," spent
  finding which of your assumptions was load-bearing. That hour is the module.

---

## A second constraint, because one is rarely enough

**At least one node must fail, and you must report it from committed evidence.**

A parallel run with no failure means one of three things: the graph was really one
node, the nodes weren't genuinely independent, or you weren't watching. None of
those is a pass.

Evidence means an artifact you committed — a log line, a branch, a command and its
output — not a sentence in your notes saying it went badly. And you must place the
failure in one of Lesson 118's five classes and say which command identified it.

---

## What to submit

```
attempts/
├── NOTES.md          what you did, what failed, what you'd change
├── SPEC.md           the acceptance checks, each with a command
├── GRAPH.md          nodes, blocking edges, the critical path
├── REVIEW.md         the doc-claims review from Lesson 117
├── DRIFT.md          the sorted claims ledger from Lesson 119
└── evidence/
    ├── preflight.txt     git log, git worktree list, git status
    ├── branches.txt      one line per node branch and its head sha
    ├── verifier.txt      the spec run, red then green
    └── clean-clone.txt   the one-command run in a fresh clone
```

A small `code/` or the actual diff belongs in there too if the artifact is code.
`NOTES.md` is required and is the part a human reads first — code alone is not a
submission, because the reasoning is where the grade lives.

`NOTES.md` must state:

- the trade-off you made and why — for example, a node you folded because two
  "independent" nodes shared a config key;
- which spec check was missing when you started, and what failure added it;
- the failure from the second constraint, its class, and the command that named it.

---

## Rules

- Work in your own repository, on your own branch. Commit as you go.
- One agent, one node, one branch, one commit. Merge before you start the next
  frontier — branches drift and merges get worse with age.
- If the clean clone fails on something this brief didn't mention, that is a
  finding. Write it down; the brief may be wrong.
- Do not disable the hook or the plugin to make the clean clone pass. If it only
  works without them, the finding is that your artifact depends on machine state.

---

## Done means

- [ ] `SPEC.md` runs as one command and failed before the work started
- [ ] `GRAPH.md` has one node per check, edges from data flow, and a named
      critical path
- [ ] At least two nodes were built in parallel, each in its own worktree, each
      with its own commit
- [ ] The verifier passes on the merged branch, from a clean clone, with
      `git status` clean afterwards
- [ ] One real failure is reported from committed evidence and placed in a class
- [ ] `REVIEW.md` resolves the build's external claims with URLs and dates
- [ ] `DRIFT.md` exists and the toolchain version is recorded with the result
- [ ] Every rubric criterion is met
- [ ] You can explain the mechanism — why the false frontier failed, which edge
      you were missing, why the witness had to be checked first — without the code
      in front of you

The last one is the real test.
