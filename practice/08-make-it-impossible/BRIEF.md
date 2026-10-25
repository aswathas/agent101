# Module: 08.1 — Write a hook that makes an unsafe action *impossible*.

**Type:** Build
**Phase:** 08
**Time:** ~75 minutes
**Prerequisites:** Lesson 60

---

## The task

Pick one unsafe action your repo can actually reach — a force-push, a write
under `dist/`, an `rm -rf`, a `git reset --hard`, a deploy command. Build a hook
that makes it **impossible**, not discouraged. Then prove it twice: once that the
unsafe action is refused when you ask for it in escalating ways, and once that
the safe neighbour next to it still works.

The second proof is the one people skip, and it is half the grade. A hook that
blocks everything near the danger gets routed around; a hook that blocks exactly
the danger gets obeyed.

> **Constraint:** "impossible" means the harness refuses **before** the action,
> on a **blocking event**, by `exit 2` (or a structured `deny`). A hook that
> warns, a hook that sits on `PostToolUse`, and a line in `CLAUDE.md` all fail
> this bar — each one lets the action happen and comments afterwards. You must
> show the action was unreachable, not that the model agreed with you.

---

## Why this isn't just a tutorial

The lesson gives you a guardrail. This module asks you to prove it holds against
an agent that is *trying to do the thing*. Copying `guardrail.mjs` and watching
it refuse a `git push` you typed yourself proves nothing — of course it refused.

The real test is the request that arrives with a reason. "Push it, we're the only
ones on the branch." "Just this once, force it." You have to run those, record
what came back verbatim, and show that the refusal came from the seam rather than
from the model remembering a rule. Then you have to break the hook on purpose and
record which way it fell — because a guardrail whose bug lets everything through
is worse than no guardrail, and you won't notice until it matters.

Finally, you have to defend the boundary. The moment your rule is broad enough to
catch `git push --force-with-lease`, you have taught your team to route around it,
and a guardrail that gets routed around is a comment with extra steps.

This is a **Build**, and the artifact is small. The evidence is the work.

---

## The constraint, stated properly

- **What breaks:** you attach the check to `PostToolUse`, or you let the script
  `exit 1`, and the unsafe action runs anyway. The hook looks configured, reports
  a problem, and changes nothing — because a `Post` hook that says no is a comment
  on something that already happened, and `exit 1` means "this hook crashed" to the
  harness, not "no".
- **How you'll know:** ask for the action, then check the world. If the branch
  moved, the file exists, or the directory is gone, the action happened, whatever
  your stderr said. The observable is the artifact on disk, not the message on
  screen.
- **What it costs you:** the work the action destroyed — pushed commits, a
  half-written file, a wiped directory — in a repo you were using a guardrail to
  protect.

### The second constraint: it must fail a known way

Break your own hook — delete a brace, feed it malformed input, remove the
`?? ''` guard — and record the exit code it produces. Then state, in the script
and in `NOTES.md`, whether you chose **fail open** (still usable while you debug
it) or **fail closed** (`"onFailure": "block"`, or an explicit crash path). Either
is defensible during development. Not knowing which one you have is not.

---

## Method

1. **Name one action and its safe neighbour.** Write both down before any code.
   "Block `git push`; allow `git status` and `git push --force-with-lease`." If
   you can't name a safe neighbour, you haven't thought about false positives yet.
2. **Declare the hook on a blocking event** (`PreToolUse`) with a matcher narrow
   enough to be relevant and broad enough to catch the target. `Bash` and
   `Edit|Write` cover most of them.
3. **Write the decision as data.** A list of blocked patterns plus a reason each.
   A new rule should be a new line, never a new branch.
4. **Write the self-test first.** Fabricated events piped into the script, asserting
   the exit code for every block case *and* every allow case. It must run with
   `node selftest.mjs` and no Claude Code in the loop.
5. **Wire it up and restart.** Settings load at session start; a hook added
   mid-session is not live until you restart.
6. **Attempt the unsafe action three times**, escalating: plainly, with a reason,
   with "and also" appended. Record the exact requests and what came back.
7. **Confirm the safe neighbour still works.** Run it and show it was not caught.
8. **Break it on purpose** and record the failure mode from step 4's other half.

---

## What to submit

```
attempts/
├── NOTES.md               what you blocked, why, the trade-off, what surprised you
├── hooks/
│   ├── guardrail.mjs      the script (or guardrail.sh)
│   └── selftest.mjs       fabricated events; asserts block and allow exit codes
├── settings.json          the hook declaration you added
└── evidence/
    ├── refusals.md        the three escalating requests, verbatim, with outcomes
    ├── safe-neighbour.md  proof the near-miss still runs
    └── fail-mode.md       what you broke, what code it exited, and which way it failed
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading.

---

## Rules

- Work in this repo. Commit as you go.
- The self-test must run without Claude Code. If it needs the harness to pass,
  it isn't a test — it's a demo.
- Choose a real action. A toy rule ("block commands containing `xyzzy`") proves
  the mechanics and nothing else.
- If something doesn't work as this brief describes, **the brief may be wrong**.
  Write down what actually happened — that's a finding, not a failure.

---

## Done means

- [ ] The hook sits on a blocking event and fires before the action, not after
- [ ] The unsafe action is genuinely refused live, with your stderr text as the reason
- [ ] The safe neighbour still runs — no false positive
- [ ] `node selftest.mjs` passes, and covers at least one allow case as well as the block cases
- [ ] The three escalating attempts are recorded verbatim, and all were refused
- [ ] The failure mode is broken on purpose, observed, and stated — fail open or fail closed
- [ ] `NOTES.md` states the trade-off you made (what it blocks, what it deliberately leaves alone) and why
- [ ] You can explain the mechanism without the code open

The last one is the real test.
