# Module: 05.1 — Author a skill. Use it. Break it. Fix the frontmatter.

**Type:** Break
**Phase:** 05
**Time:** ~75 minutes
**Prerequisites:** Lesson 44, Author a Skill From Scratch

---

## The task

Write one skill for a workflow you genuinely run. Make it work. Then break it in
at least three ways that fail *silently* — no error, the command still in the
menu, the model simply never picks it up — and get back to working each time by
fixing something specific rather than rewriting the whole file.

> **Constraint:** at least two of your three breakages must be failures the
> skill's own author cannot see. A skill you have edited a hundred times reads
> correctly to you. The break has to be the kind you find by asking what a
> stranger would type, or by reading a debug log.

---

## Why this isn't just a tutorial

Writing a skill that works once is a prompt with a YAML header. The part worth
practising is the diagnosis: two completely different causes — a description
that doesn't match human phrasing, and frontmatter that doesn't parse — produce
the *identical* symptom. One you fix by editing words. The other you can edit
words at forever and never fix, because the words were never the problem.

The habit being built: when something loads but doesn't fire, ask which of the
two it is *before* changing anything.

---

## The constraint, stated properly

- **What breaks:** the skill stops firing, or stops being obeyed partway through
  a task, with no error anywhere
- **How you'll know:** `/name` still works; a natural request doesn't trigger it
- **What it costs you:** the exact afternoon in this lesson's opening problem —
  an hour spent improving a description while the YAML underneath was broken

---

## What to submit

```
attempts/
├── NOTES.md               what you did, what surprised you, what you'd do differently
├── <your-skill>/          SKILL.md plus anything it references
├── broken/                one copy per breakage, with what you changed
└── evidence.md            before/after for each breakage, and how you identified it
```

`NOTES.md` is required. A working skill with no record of how you broke it is
not a submission — the breaking is the point of this module.

---

## Rules

- Work in this repo. Commit as you go (`CLAUDE.md` has the conventions).
- Use `phases/05-commands-and-skills/44-author-a-skill/code/check-frontmatter.mjs`
  — but run it **after** you have diagnosed at least one breakage by hand. The
  script tells you a field is unknown; it does not tell you why your skill isn't
  firing.
- If something doesn't work as this brief describes, **the brief may be wrong**.
  Write down what actually happened — that's a finding, not a failure.
- Deliberately destructive steps are fine on a skill you just wrote. Don't run
  them against a skill that currently works for someone else.

---

## Done means

- [ ] The skill exists, runs, and is invoked both ways — by slash and by description
- [ ] Three or more breakages, each identified by a *reason* rather than a guess
- [ ] Each breakage recorded with its symptom, its cause, and its fix
- [ ] `NOTES.md` states the trade-off you made and why
- [ ] You can explain the mechanism without the file in front of you