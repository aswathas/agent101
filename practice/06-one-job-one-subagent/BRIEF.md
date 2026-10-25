# Module: 06.1 — Write a subagent that does one job perfectly and refuses everything else.

**Type:** Build
**Phase:** 06
**Time:** ~60 minutes
**Prerequisites:** Lesson 48

---

## The task

Author a subagent for a job you actually repeat — reviewing an incident report,
triaging a dependency bump, checking a config file against a checklist, whatever
your week really contains. It has to do that job **and refuse everything else**.

Then prove the refusal. Not by reading your own prompt and agreeing with it. By
feeding it requests it should decline, and showing what came back.

> **Constraint:** the refusal must not depend on the model agreeing with your
> prose. `Edit` in the tool pool means a sufficiently plausible request *will*
> eventually talk its way through. Your agent has to decline where declining is
> structural — and you have to demonstrate which layer did the declining, because
> "the body told it not to" and "the tool wasn't there" are different claims with
> different reliability.

---

## Why this isn't just a tutorial

Writing a subagent file takes five minutes. That is not the exercise.

The exercise is that the *last* test you run — the one with "and also fix the
typo" appended — is the one that matters. Scope creep arrives with an "and." Any
body you write can be talked past by a well-argued request, and the only defence
that survives an unattended run is a capability you never granted.

You will not know which layer of your agent did the work until you remove the
other layers and re-run the same request.

---

## The constraint, stated properly

- **What breaks:** you ship an agent with a long, careful refusal section, feel
  good about it, and it does the out-of-scope thing anyway — because the tool
  was available and the request sounded reasonable.
- **How you'll know:** you run the same out-of-scope request twice. Once with the
  refusal section in the body. Once with the offending tool removed from the
  pool. If the second version declines and the first one wavered, your "refusal"
  was a suggestion.
- **What it costs you:** a wrong edit in a real file, made by an agent you built
  specifically to be safe, which is the failure mode that teaches you the lesson
  hardest.

### The second constraint

The agent must work from **your** context, not from what a hypothetical author
would have written. If your project has no repeatable narrow job, build one:
pick a file type you edit often and a check you run by hand.

---

## What to submit

```
attempts/
├── NOTES.md          what you did, what surprised you, the trade-off you made
├── agents/<name>.md  your subagent
├── checks.md         the requests you ran and what came back
└── evidence/         the checker's output, and your before/after refusal runs
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading.

---

## Rules

- Work in this repo. Commit as you go (`CLAUDE.md` has the conventions).
- Use `phases/06-subagents/47-author-a-subagent/code/check-subagent.mjs` on your
  file. Clean is the floor, not the goal.
- If you get stuck, say where. A documented dead end beats a silent struggle.
- If something doesn't work as the brief describes, **the brief may be wrong**.
  Write down what actually happened — that's a finding, not a failure.

---

## Done means

- [ ] `check-subagent.mjs` reports zero errors on your agent
- [ ] The job works: you ran it on real input and it produced the right result
- [ ] The refusal works: at least three out-of-scope requests declined, one of
      them with "and also" appended
- [ ] You can name which layer did the declining, with evidence from a run where
      you removed a layer and the behaviour changed
- [ ] `NOTES.md` states the trade-off you made and why
- [ ] You can explain the mechanism without the file in front of you