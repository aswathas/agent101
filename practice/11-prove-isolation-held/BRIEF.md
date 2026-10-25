# Module: 11.1 — Build a parallel system. Prove isolation held.

**Type:** Build
**Phase:** 11
**Time:** ~60 minutes
**Prerequisites:** Lesson 76

---

## The task

Set up at least three agents editing this repository at once, each owning a
different set of files. Then produce evidence that isolation *actually held* —
which is a higher bar than "nothing crashed":

- each writer ran with file isolation (a session worktree, a per-agent worktree,
  or one session worktree with disjoint subagents),
- each writer **committed** its work on a branch you can tell apart from `main`,
- and you can point at the mechanism — not your prompt — that prevented a
  collision.

Then map the boundary in both directions. Show one path that *would* have
collided without isolation. Show one command the isolation checks do **not**
stop.

> **Constraint:** a worktree with no commit is not a backup. Three agents can
> produce perfect work in perfect isolation and leave you nothing to merge if
> every branch points at `main`. Your evidence has to be commits on
> distinguishable branches, or the run fails regardless of how good the work was.

---

## Why this isn't just a tutorial

Spawning agents is the easy half. The work is knowing *which layer* did the
isolating. A clean run proves nothing on its own: the agents might not have
overlapped, or the model might simply have behaved. A branch with no commit
proves nothing about the work.

You will not know whether isolation held until you can name the mechanism and
show the commit it produced. "The agent was told not to" is a sentence about your
prompt, not about the harness.

---

## The constraint, stated properly

- **What breaks:** each writer finishes in its own worktree, never commits, and
  exits. Every branch points at `main`. There is nothing to merge and the
  "isolated" work is effectively gone.
- **How you'll know:** in each writer's location, `git branch --show-current` and
  `git log -1 --oneline` show no commit of its own.
- **What it costs you:** the entire run — and then you redo it in the main
  checkout, where the collisions you were avoiding are possible again.

A second constraint, on the evidence rather than the code: prove the mechanism,
not the prose. If your proof is "the prompt said not to," it is not proof of
isolation.

---

## What to submit

Put your work in `attempts/`:

```
attempts/
├── NOTES.md        what you did, what surprised you, the trade-off you made
├── runs.md         one row per writer: mechanism, worktree path, branch, commit
├── collision.md    the path that could have collided, and the layer that saved it
└── evidence/       git worktree list, git log --graph --all, refusal messages verbatim
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading.

---

## Rules

- Work in this repo. Commit as you go (the repo's `CLAUDE.md` carries the
  conventions).
- Use at least three writers. Two is not a system; it is a coincidence.
- Capture refusal messages verbatim. A paraphrase is not evidence.
- If something doesn't work as the brief describes, **the brief may be wrong**.
  Write down what actually happened — that is a finding, not a failure.

---

## Done means

- [ ] Every writer committed on a branch distinguishable from `main`
- [ ] `runs.md` names, per writer, the mechanism, the worktree path, the branch,
      and the commit hash
- [ ] You showed one would-be collision and named the layer that prevented it
- [ ] You showed one command the isolation checks do not stop, and said where it
      is governed instead
- [ ] `NOTES.md` states the trade-off you made and why
- [ ] You can explain the mechanism with the code closed
