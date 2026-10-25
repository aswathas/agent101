# Module: 09.1 — Package your skill + subagent + hook as one installable plugin.

**Type:** Build
**Phase:** 09
**Time:** ~60 minutes
**Prerequisites:** Lesson 64

---

## The task

Take three components you built in earlier phases — one skill, one subagent, one
hook — and package them as a single plugin. Not three plugins. One directory,
with a manifest, that a teammate on another machine installs by name and that
updates as one unit.

Then prove it, on a machine-state you don't control: disable everything you
have locally, install only from your marketplace entry, and show the guardrail
still blocks.

> **Constraint:** the plugin must install into a session where none of the
> originals exist. No copy left in `~/.claude/`, no hook left in
> `.claude/settings.json`, no reliance on `--plugin-dir`. If a component only
> works on your machine, it is not in the plugin.

---

## Why this isn't just a tutorial

Following Lesson 63's steps gives you a plugin that loads on *your* machine,
where three components already exist and quietly cover for anything you forgot
to package. That is the most common outcome and it is invisible: the skill
works, so you never notice you left it behind.

The isolation is the point. Remove the originals first, then install. Anything
that only worked because of a leftover is now broken, and broken is the signal
you want.

---

## The constraint, stated properly

- **What breaks:** the plugin loads, three components appear, and one of them
  behaves as if your local copy is still doing half the work. Later you hand the
  plugin to someone and their version is missing a guardrail that yours silently
  had.
- **How you'll know:** in the clean session, `git push --force` is refused by
  *your plugin's hook*, and `/plugin` → Installed shows `guardrail-kit` as the
  only source of it. Confirm with `/doctor` and by grepping your settings files
  for the hook's command string — it must appear nowhere but the plugin.
- **What it costs you:** the twenty minutes where nothing works and you can't
  tell whether the bug is in the plugin or in what you deleted. That is the
  intended cost. Do it before you submit, not after.

---

## A second constraint, because one is rarely enough

**Every component must be individually necessary.** Remove any one of the three
and something must break. If your subagent does work the skill also does, you
have two components and a count, not a design.

Say which one you would cut first if you had to ship two, and why.

---

## What to submit

```
attempts/
├── NOTES.md          what you did, what surprised you
└── guardrail-kit/    (or your plugin's name)
    ├── .claude-plugin/plugin.json
    ├── skills/
    ├── agents/
    ├── hooks/
    └── scripts/
```

Plus, in `NOTES.md`:

- the transcript of the clean-session test — the force push being refused, and
  the grep that shows your hook string is in exactly one place
- `claude plugin details <name>` output, with which component pays most
- your answer to "which one would you cut first"

`NOTES.md` is required. Code alone is not a submission.

---

## Done means

- [ ] The plugin installs and all three components work in a session with the
      originals removed
- [ ] `claude plugin validate` passes
- [ ] The hook blocks the dangerous command, and you have shown the output
- [ ] Every rubric criterion is met
- [ ] `NOTES.md` states the trade-off you made and why
- [ ] You can explain the mechanism — namespacing, one unit, no hook
      de-duplication — without the code in front of you