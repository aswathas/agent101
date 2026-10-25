# Module: 16.1 — Reproduce the empty-branch bug. Then prevent it.

**Type:** Break
**Phase:** 16
**Time:** ~60 minutes
**Prerequisites:** Lesson 110

---

## The task

Reproduce, on purpose, the failure where an isolated agent does real work and
leaves **nothing to merge** — a worktree whose folder is full of edits while its
branch still points at `main`. Capture the evidence that proves the branch is
empty and the folder is not. Then build a prevention that makes the failure
impossible or loud, rather than a note reminding you to be careful.

Both halves are required. Reproducing it teaches you the signature; preventing it
is the only part that changes tomorrow.

> **Constraint:** the prevention must **fire on a worktree with uncommitted work
> and stay quiet on a committed one**. A checklist or a line in a prompt is not a
> prevention — the failure is silent, and the one who forgets is the agent.

---

## Why this isn't just a tutorial

Git will let an agent edit for an hour with zero commits and report complete
success. Nothing errors, no warning appears, and the branch looks normal. You
cannot learn the shape of that failure by reading about it — you have to watch a
branch stay at `main` while the folder fills up, and then watch the work
disappear when the folder goes.

The obvious move — "I'll just remember to commit" — is exactly the move that
fails, because the person doing the forgetting is not the person writing the
reminder.

---

## The constraint, stated properly

- **What breaks:** the worktree's branch label never moves from the base, so the
  repository sees no work on that branch. Removing the worktree deletes the
  uncommitted edits, and no git command can recover them.
- **How you'll know:** from the main checkout, `git log --oneline main..<branch>`
  prints nothing, while `git -C <worktree> status --porcelain` prints something.
  Empty branch, dirty folder.
- **What it costs you:** a finished piece of work, silently — the afternoon the
  agents ran, plus the confidence that "the agent said it was done" meant
  something.

---

## What to submit

Put your work in `attempts/`:

```
attempts/
├── NOTES.md            what you did, what surprised you, the trade-off you chose
├── evidence.md         the commands and their real output (empty range + dirty folder)
├── prevention/         the script, hook, or committed instruction file that does the checking
└── prevention-proof.md the prevention refusing a dirty worktree and passing a clean one
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading.

---

## Rules

- Work in this repo, or a scratch repo you create for the exercise. Commit as you
  go.
- The reproduction must use a **real worktree** with **real edits** — not a
  described scenario.
- If the failure does not reproduce the way this brief says it will, **the brief
  may be wrong**. Write down what actually happened. That is a finding, not a
  failure.

---

## Done means

- [ ] You reproduced a worktree branch that is empty while its folder is dirty,
      and saved the two outputs that show it.
- [ ] You removed the worktree and confirmed the uncommitted work was gone.
- [ ] A prevention artifact exists in the repo and is committed.
- [ ] The prevention fires on a dirty worktree and passes on a committed one.
- [ ] `NOTES.md` states the trade-off you chose and why.
- [ ] You can explain the mechanism without the code in front of you.

The last one is the real test.
