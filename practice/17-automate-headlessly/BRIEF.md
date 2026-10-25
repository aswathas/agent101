# Module: 17.1 — Automate a real task headlessly, end to end.

**Type:** Build
**Phase:** 17
**Time:** ~60 minutes
**Prerequisites:** Lesson 115

---

## The task

Build one command that automates a task you actually repeat — a changelog, a
lint-and-fix pass, a test triage, a release-note draft — and make it run
end to end with no human in the loop. The command takes input, runs Claude
non-interactively, emits a machine-readable result, and fails loudly when the
run fails. It must produce the same result on a machine that has none of your
personal setup, because it loads only what it is told to load and nothing from
the host.

> **Constraint:** it must run from a clean environment — a fresh shell, a
> container, or CI — where your `CLAUDE.md`, hooks, skills, MCP servers, and
> subscription login do not exist. A version that only works on your laptop
> does not count as automating anything.

---

## Why this isn't just a tutorial

Copying an interactive prompt into `claude -p` is the obvious move, and it is
the one that fails. It works on your machine because your machine is doing
silent work: it loads your project memory, your hooks fire, your MCP servers
connect, and your login answers. Move the same line to a runner and every one
of those assumptions is gone — or worse, replaced by a teammate's config in a
bare-mode-less run, so the "same" command behaves differently per machine.

The work here is making the run depend on what the command *passes*, not on
what the machine *has*. That means running in a mode that skips auto-discovery,
supplying the context you need explicitly, pre-approving the tools the task
requires, and proving all of it by running somewhere clean.

---

## The constraint, stated properly

- **What breaks:** without an explicit, self-contained context, the run's
  behaviour depends on the host — it can silently differ per machine, or hang
  waiting for an approval that will never come, or exit `0` after a failure
  because the script never checked the exit code.
- **How you'll know:** run the command twice, once in your full environment and
  once in a clean one (fresh user config, a container, or CI). The outputs
  differ, or the clean run hangs, or a failed run reports success.
- **What it costs you:** spent CI minutes, an artifact committed from a failed
  run, and an afternoon spent calling a reproducible difference "flaky."

---

## What to submit

```
attempts/
├── NOTES.md            what you did, what surprised you, the trade-off you made
├── scripts/            your command, runnable as-is
└── evidence/           a clean-environment transcript and a sample output
```

`NOTES.md` is required. A script alone is not a submission.

---

## Done means

- [ ] The command runs from a clean checkout with no personal setup and exits `0`
- [ ] Its output is machine-readable and has a stable shape on two machines
- [ ] A failed run exits non-zero and says what failed
- [ ] It never waits for a prompt; it finishes unattended
- [ ] Each rubric criterion is met
- [ ] `NOTES.md` states the trade-off you made — especially what `--bare` cost
      you — and why that is correct for this task
- [ ] You can explain the mechanism without the code in front of you
