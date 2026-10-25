# Module: 13.1 — Cut a bloated context by half. Prove capability survived.

**Type:** Instrument
**Phase:** 13
**Time:** ~90 minutes
**Prerequisites:** Lesson 90 (Reducing Context Without Losing Capability)

---

## The task

Take a real project whose context has grown — a fat `CLAUDE.md`, several long
skills, a pile of rules, a house-style guide pasted in "just in case" — and cut
its **standing cost** by at least half. Then prove, with a task that would fail
if you had simply deleted anything, that the capability survived.

The artifact is two things paired: a before/after measurement, and a capability
test. Neither alone counts. A smaller number with no proof is a deletion waiting
to be discovered. A proof with no measurement is not an instrument.

> **Constraint:** you may not lose a single capability. Every fact you remove
> must be cheaper *because it loads later*, not gone. The grader will run the
> capability test from a fresh session against your reduced setup.

---

## Why this isn't just a tutorial

Deleting is easy and feels like progress. It halves the number, the session
starts fast, and nothing complains — for about a week, until a skipped check
surfaces in production.

This module forces the hard part: for each fact, name the home it loads back
from, and name the task that proves it still works. That is the difference
between a tidy window and a broken one, and it is the skill the phase is about.

---

## The constraint, stated properly

- **What breaks:** naive deletion. You remove a release check or an error-shape
  convention from `CLAUDE.md`, the window drops, and the first failure appears
  days later as an incident you cannot connect to the edit.
- **How you'll know:** your capability test fails, or you cannot say where a
  removed fact loads back from, or a `Delete` row has no statement of where the
  repo already says the same thing.
- **What it costs you:** an afternoon now, or a silent production bug later. The
  size number never tells you which you got.

---

## What to submit

Put your work in `attempts/`:

```text
attempts/
├── NOTES.md                  what you did, what surprised you, the trade-off
├── before.md                 the baseline: /context capture + the representative
│                             task's context growth, commands recorded
├── architecture.md           the line-by-line table: fact / decision / new home / why
├── after.md                  the same two measurements, same conditions
└── capability-test.md        the task that needs a relocated fact, plus its
                              transcript and the evidence it loaded on demand
```

`NOTES.md` is required. Numbers alone are not a submission — the reasoning about
*where each fact went* is the part worth reading.

---

## Rules

- Work in a real repo you use. A scratch repo has no standing charges worth
  measuring, which defeats the point.
- Keep the conditions identical between before and after: same session type,
  same task, same machine.
- If a cut cannot pass the capability test, put the fact back and say so. A
  documented dead end is a finding.
- If the brief does not match what you observe, the brief may be wrong. Write
  down what actually happened.

---

## Done means

- [ ] `before.md` and `after.md` show at least a 50% reduction in standing cost,
      measured the same way
- [ ] `architecture.md` gives every changed fact a named new home
- [ ] `capability-test.md` shows a named task completing from a fresh session
      against the reduced setup
- [ ] `NOTES.md` names the trade-off you made and why
- [ ] You can explain, without the files open, why each cut is relocation and
      not deletion

The last one is the real test.
