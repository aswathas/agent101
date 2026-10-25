# Module: 10.1 — Write a CLAUDE.md that changes behavior. Prove it.

**Type:** Build
**Phase:** 10
**Time:** ~60 minutes
**Prerequisites:** Lesson 70

---

## The task

Write a `CLAUDE.md` for a project you actually work in, and prove — with two fresh sessions and no conversation history — that it changes what the agent does. Not what it *says* it will do. What it does.

The artifact is small. The proof is the work. A `CLAUDE.md` is easy to write and easy to fool yourself about: it reads well, it looks thorough, and a fresh session behaves exactly as it did before, because every line was either something the agent could already derive or something it was already doing.

> **Constraint:** the before/after must run in two fresh sessions — one in a copy of the project with no `CLAUDE.md`, one with it — using the *same* task prompt. If the behavior change only appears because you told the agent in chat, it is not in the file, and the module is not done.

---

## Why this isn't just a tutorial

Following the lesson steps gives you a `CLAUDE.md` that loads. That is the easy half, and it is invisible whether it works: the file is listed in `/context`, so you assume it is doing something.

The hard half is that most instructions change nothing. Build commands the agent could find by reading `package.json` change nothing. "Write clean code" changes nothing. The instructions that change behavior are the ones the agent could not have known and the ones you can check it against.

This module forces the difference into the open, because a before/after you have to produce is a before/after you cannot fake.

---

## The constraint, stated properly

- **What breaks:** you write a thorough `CLAUDE.md`, feel good about it, and the fresh session behaves identically to the one without it. Everything in the file was derivable or already default behavior.
- **How you'll know:** the two transcripts are the same in the place you expected them to differ. You can point at the task output and see no change.
- **What it costs you:** the hour where you rewrite the file around the one instruction that actually moved the agent, and delete the rest. That is the intended cost. Pay it before you submit.

---

## A second constraint, because one is rarely enough

**Every line must earn its place.** For each instruction, say in `NOTES.md` whether the agent could derive it from the code, and whether the default behavior already did it. An instruction that fails both tests is a line of context spent for nothing.

Then name the one line that changed behavior most, and why.

---

## What to submit

Put your work in `attempts/`:

```
attempts/
├── NOTES.md              what you did, what surprised you
├── CLAUDE.md             the file under test
├── before.md             transcript of the fresh session with no CLAUDE.md
└── after.md              transcript of the fresh session with it
```

In `NOTES.md`, also include:

- the exact task prompt you used in both sessions
- the `/context` output showing `CLAUDE.md` under **Memory files**
- for each instruction, "derivable?" and "default already?" — yes or no
- the one instruction that changed behavior most, and the observable difference it made

`NOTES.md` is required. A `CLAUDE.md` alone is not a submission — the reasoning is the part worth reading.

---

## Rules

- Work in a real project. A toy repo makes the "derivable?" test trivial and teaches nothing.
- Keep the file under 200 lines. If it isn't, the 200-line rule is the first thing you learned and the first thing you skipped.
- If a fresh session ignores your rule even though `/context` lists the file, that is a finding, not a failure. Write down what actually happened — the brief may be wrong.
- Commit as you go. `CLAUDE.md` is a file in your repo, and a repo without a commit is not a backup.

---

## Done means

- [ ] `CLAUDE.md` exists, is under 200 lines, and loads (shown by `/context`)
- [ ] `before.md` and `after.md` are transcripts of the same prompt in two fresh sessions
- [ ] The behaviors differ, and `NOTES.md` names the line responsible
- [ ] Every line is justified as non-derivable or a changed default
- [ ] Each rubric criterion is met
- [ ] You can explain, without the file open, why a long `CLAUDE.md` loses to its own length

The last one is the real test.
