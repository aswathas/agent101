# Module: 03.1 — Route a real workload across model tiers. Find where the frontier model was wasted.

**Type:** Instrument
**Phase:** 03
**Time:** ~60 minutes
**Prerequisites:** Phase 03, Lessons 19–26

---

## The task

Take **one workload you actually run** — a script, a pipeline, a batch job, or a loop you drive by hand — and produce a **model routing plan** for it.

The plan is not the deliverable on its own. It is the plan *plus the inventory that justifies it*: every call the workload makes, what shape its answer is (a decision or a generation), which tier it runs on today, and what that costs at your real volume. Then a re-routing that moves each call to the cheapest tier that keeps the answers the same, and a written reason for the calls you deliberately leave where they are.

> **Constraint:** the workload's answers must not change on a fixed check set of twenty examples. "Cheaper" achieved by degrading answers is a failed attempt, not a win. Record the check set's results **before and after** the re-routing, and keep at least one call on a larger model, with a written reason.

---

## Why this isn't just a tutorial

The obvious version of this task is: swap the model, compare the bill, call it done. That produces one number and teaches nothing, because it cannot tell you **which** call the swap damaged.

The instrument is the inventory. Once every call has an output shape and a tier written next to it, the waste stops being invisible — you can point at the call that ran on a frontier model to return a single word, and at the check set that would have caught the damage if you had moved something that mattered.

Two things consistently surprise people doing this:

1. **The expensive call is rarely the hard one.** It is usually the many easy ones, each returning a sentence where a label would do.
2. **A change that keeps the workload running can still change its answers.** Nothing crashes; the outputs just drift. The check set is the only thing that notices.

---

## The constraint, stated properly

- **What breaks:** you move everything to the cheapest tier, the workload still runs, and the answers quietly change. No error, no crash — just different labels and different summaries.
- **How you'll know:** the twenty-example check set disagrees with the old routing, or a downstream consumer changes behaviour. If you did not build the check set, you will not know at all.
- **What it costs you:** an hour here, on a workload you can inspect. On a real system, a silently wrong answer that surfaces weeks later, attached to a decision somebody already made.

---

## What to submit

```
attempts/
├── NOTES.md            what you did, what surprised you, the trade-off you accepted
├── inventory.md        one row per call: shape, tier today, tokens, cost
├── routing.md          the proposed routing, and a reason per changed call
└── evidence/           the twenty-example check set, before and after, plus /usage numbers
```

`NOTES.md` is required. The running code is not the submission — the reasoning is.

Your inventory should look like this, filled in:

| Call | Shape (D/G) | Tier today | Output tokens per run | Cost per run | Proposed tier | Reason |
|---|---|---|---|---|---|---|
| | | | | | | |

Every row needs all seven columns. A blank shape or a missing cost is an incomplete instrument.

---

## Rules

- Use a workload you genuinely run. A made-up one teaches you nothing about your own habits.
- Volume is part of the answer. A per-call cost difference means nothing without the number of calls.
- Estimate rather than stall. If a cost cannot be measured, say how you estimated it and move on.
- Keep the check set **out of** any tuning. Twenty inputs with known good answers, written before you route.
- Commit as you go. An uncommitted attempt is not a backup.
- If the brief does not match what you find, write down what actually happened. That is a finding, not a failure.

---

## Done means

- [ ] The inventory covers **every** call the workload makes, not a sample
- [ ] Every call carries an output shape (D or G) and a cost
- [ ] A twenty-example check set exists and was run under both the old and the new routing
- [ ] The re-routing keeps every check-set result, or explicitly names the one it accepts losing and why
- [ ] At least one call stays on a larger model, with a written reason drawn from the lessons
- [ ] `NOTES.md` states the trade-off you accepted and the number that decided it
- [ ] You can explain the mechanism — why the waste was where it was — without the code open

The last one is the real test. If you can only explain it with the code in front of you, the instrument is not yours yet.
