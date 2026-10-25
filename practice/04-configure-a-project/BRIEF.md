# Module: 04.1 — Configure a real project. Know which settings file won.

**Type:** Build
**Phase:** 04
**Time:** ~75 minutes
**Prerequisites:** Lesson 37

---

## The task

Build a small scratch project whose Claude Code settings are deliberately spread
across layers, then prove — with a capture, not a claim — which layer wins for
every key that collides.

The deliverable is the project, a one-launch settings file you point at with
`--settings`, and a `RESOLUTION.md` that names, for each conflicting key: the
layers that set it, the winning layer, whether the values merged (array) or
replaced (scalar), and the single observation that proves it.

It isn't obvious because the value you get in a session is often **not** the value
in the file you just edited. Editing harder at the same layer changes nothing.

> **Constraint:** at least one scalar key must be set to different values at two
> layers, and at least one array key must be set at two layers so that both entries
> stay live. A setup where every key lives in one file passes nothing, because there
> is no override to observe.

---

## Why this isn't just a tutorial

The obvious approach — put each rule in the nearest settings file and move on —
never exercises the override, so it teaches you nothing about precedence. Here the
override **is** the product: you must make two layers disagree on purpose, watch
which one wins, and explain why. That is the difference between *having* settings
and *knowing which one won*.

---

## The constraint, stated properly

- **What breaks:** your edit lands in a layer that loses, so the session keeps the
  old value; or your deny rule merges with a broader allow and the path is still
  reachable.
- **How you'll know:** the same key has two different values in two files, the
  session shows only one of them, and removing the winning layer changes the
  session's behavior.
- **What it costs you:** time spent editing the wrong file — and if you commit a
  personal rule to the shared file, you change behavior for everyone who clones
  the repo.

---

## What to submit

Put your work in `attempts/`:

```
attempts/
├── NOTES.md                          what you did, what surprised you
├── project/                          scratch project, containing:
│   ├── .claude/settings.json             project-shared layer
│   ├── .claude/settings.local.json       project-local layer
│   └── .env                              the file your deny rule guards
├── overrides/launch-settings.json    a layer you point at with --settings
├── RESOLUTION.md                     the precedence table and the proof per key
└── captures/                         pasted session output (refusals, before/after)
```

`NOTES.md` is required, and so is `RESOLUTION.md`. A session log alone is not a
submission — the reasoning about which layer won, and why, is the part worth
reading.

---

## Rules

- Work in this repo. Commit as you go.
- Do **not** edit your real user settings file (`~/.claude/settings.json`). Use the
  project files and the `--settings` flag. The user layer is the floor; leave it
  alone.
- If something doesn't work as the brief describes, **the brief may be wrong**.
  Write down what actually happened — that's a finding, not a failure.

---

## Done means

- [ ] The scratch project exists with a file at each layer named above.
- [ ] At least one scalar key and one array key collide across layers.
- [ ] `RESOLUTION.md` names the winning layer and the proof for every colliding key.
- [ ] A capture shows the deny rule refusing a read, and another shows the behavior
      change when the winning layer is removed.
- [ ] `NOTES.md` states the trade-off you made and why.
- [ ] You can explain why a setting you edited did not take effect, without the
      files open.

The last one is the real test.
