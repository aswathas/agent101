# Module: 14.1 — Instrument a real loop. Find the 20% of calls costing 80%.

**Type:** Instrument
**Phase:** 14
**Time:** ~60 minutes
**Prerequisites:** Lesson 97

---

## The task

Take a real agent loop you actually ran — a Phase 12 workflow, a Claude Code
session, or the harness you built in Lesson 97 — instrument every model call,
and produce a **cost ledger**: one row per call with what it did, how many
tokens it used, and whether its output was used.

Then find the smallest set of calls that accounts for ~80% of the spend, and
label each expensive call **decision** or **generation** (Lessons 92–93).

The point isn't the number. It's that once you can see the calls, the fix is
usually obvious and cheap — a decision on the wrong tier, or a call whose output
nobody read.

> **Constraint:** You may only observe. Do not change the loop to make it
> cheaper until the ledger is complete. A ledger built after you've optimized
> measures the optimization, not the problem.

---

## Why this isn't just a tutorial

The obvious move is to sort calls by per-call cost and fix the biggest one. That
misses the real pattern: a cheap decision call that runs 400 times beats one big
generation call. Instrumenting the loop teaches you where the money actually
goes, which is almost never where you'd guess.

---

## The constraint, stated properly

- **What breaks:** sorting by per-call cost points you at the wrong call, and
  the change you make saves nothing.
- **How you'll know:** your expensive set contains at least one call whose
  single-call cost was small but whose call count was large.
- **What it costs you:** the optimization you skipped — and any credibility in
  the number, because an unledgered claim can't be checked.

---

## What to submit

Put your work in `attempts/`:

```
attempts/
├── NOTES.md      what you did, what surprised you, what you'd change
├── ledger.md     one row per call (or ledger.csv)
└── finding.md    the expensive set, its share of cost, and the recommendation
```

`ledger.md` needs these columns: `call id`, `purpose`, `D/G`, `input tokens`,
`output tokens`, `count`, `est. cost`, `output used? (Y/N)`.

`NOTES.md` is required. A number without the ledger behind it is a guess.

---

## Rules

- Work in this repo. Commit as you go (`CLAUDE.md` has the conventions).
- Use a real loop with at least ten model calls — not a toy written for this
  module.
- If a call's cost can't be attributed, say so. An honest gap beats a fabricated
  estimate.
- Pricing drifts. Record the model alias you used, its price per million tokens,
  and the **date** you looked it up.

---

## Done means

- [ ] `ledger.md` has one row per call with every required column
- [ ] The expensive set is identified and its share of total cost is stated
- [ ] Every expensive call is labelled decision or generation
- [ ] `NOTES.md` states the trade-off and one surprise
- [ ] You can explain the mechanism without the ledger in front of you

The last one is the real test.
