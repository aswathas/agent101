# Module: 12.1 — Write a workflow with propose → verify. Hit the completion-order trap *on purpose*.

**Type:** Break
**Phase:** 12
**Time:** ~90 minutes
**Prerequisites:** Lesson 85; Lessons 78–81 for the script itself

---

## The task

Write a dynamic workflow that does two things in sequence. First it produces
several independent proposals for one problem. Then it runs a separate verifier
against each proposal, so a weak idea does not get a friendly review.

Then join the two sets of results — and join them the way it is *easy* to join
them: drop the empty holes and match by position. Run it, and lose one agent in
the middle of the second fan-out. The join will print a line where a verdict sits
beside the wrong proposal, reading exactly like a finding.

Your job is to make that failure visible, write it down, and then fix the join
without hiding anything.

> **Constraint:** a lost agent leaves its slot in place, and nothing in the
> results array says which slot was lost. So the naive join is not obviously
> wrong — it is wrong only *after* a loss, and it is wrong silently. You must
> make the mislabelling readable in the artifact, which means every proposal and
> every verdict has to carry a marker a grader can match by eye.

---

## Why this isn't just a tutorial

A tutorial would have you wire up `pipeline()` and print a result. That produces
output which reads perfectly and is, after one loss, wrong in a way no one
notices.

The thing this teaches is what a mislabelled artifact *looks like* before anyone
knows it is mislabelled. You are going to build the failure, look at it, and then
find the one line where the two versions of the script diverge. That line is the
lesson; the workflow is just the vehicle.

It is also the failure mode this repo actually hit, twice: a red suite blamed on
three workers when the runner was wrong, and three perfect worktrees with no
commits and nothing to merge. In both cases the evidence arrived in one shape and
the cause lived somewhere else.

---

## The constraint, stated properly

- **What breaks:** a fan-out member is lost — you stop it, or it stalls out — and
  the array you get back has a hole where it was. Anything that closes the hole
  shifts every later result one or more positions, silently.
- **How you'll know:** the output contains at least one line where a verdict
  about one proposal is printed beside a different proposal. In the run without a
  loss, no such line exists — which is what makes the bug easy to miss and worth
  seeing once.
- **What it costs you:** an afternoon rewriting a proposal that was never the
  problem, or a reviewer who trusts a report nobody can vouch for. In this repo's
  case, that cost was a wrong glob in `package.json`, a red suite, and the blame
  landing on the work.

A second, smaller constraint: the fix is not "don't lose agents". You cannot
guarantee that, and a plan that depends on it is not a plan. The fix has to keep
working *while* an agent is lost.

---

## What to submit

```
attempts/
├── NOTES.md
├── workflows/
│   ├── propose-verify-naive.js      the join that filters and zips
│   └── propose-verify-fixed.js      the join that binds before it filters
└── evidence/
    ├── run-with-loss.txt            a run that lost at least one agent
    └── run-fixed.txt                the same case, joined correctly
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading, and specifically: which line differs between the two scripts,
and what the naive one believed about the array it was handed.

Two practical notes.

**Force a loss.** You cannot make an agent fail on demand, so the reliable method
is to stop one yourself: open `/workflows` while the second fan-out is running,
select a middle verifier, and press `x`. Pick one that is not first or last, or
you will not shift anything.

**If workflows are unavailable on your plan,** say so in `NOTES.md` and reproduce
the same shape with the tools you have — several background or non-interactive
sessions, joined by a script of your own. The trap is not a workflow feature. It
is what happens when you match two lists positionally after one of them has been
shortened.

---

## Rules

- Work in this repo. Commit as you go.
- Keep the two scripts side by side. The diff between them is part of the
  submission, so do not edit one into the other.
- Do not make the proposals easy to tell apart. Five differently-worded proposals
  about the same problem is the point; five obviously different topics would let
  the mislabelled output look correct.
- If something does not work as this brief describes, **the brief may be wrong.**
  Write down what actually happened. That is a finding, not a failure.

---

## Done means

- [ ] Both scripts exist, run, and have `export const meta` as their first statement
- [ ] A run with a lost agent exists as evidence, and the naive join mislabels a line in it
- [ ] The fixed join produces no mislabelled line on the same case, and marks the lost one
- [ ] `NOTES.md` names the exact line where the two joins diverge, and the trade-off you made
- [ ] Each rubric criterion is met
- [ ] You can explain, without the code open, what the identity of a result is

The last one is the real test.
