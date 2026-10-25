# Loops — Scheduled and Recurring

> A loop is a timer bound to a live session. It fires between your turns, it
> cannot catch up, and it forgets itself after seven days.

**Type:** Build
**Prerequisites:** Phase 04 Lesson 30 (Sessions, `/clear`, `/compact`), Lesson 78 (Dynamic Workflows)
**Time:** ~40 minutes

---

## Learning Objectives

- Run a prompt on a fixed interval, and on an interval Claude chooses
- Read a scheduled task back — its ID, its schedule, and when it fires next
- Prove the two behaviours that surprise people: no catch-up, and session scope
- Replace a bare `/loop` with your own default prompt using `loop.md`
- Decide between `/loop`, `/goal`, and a cloud routine for a given job

---

## The Problem

A deploy was rolling out. The plan was sensible: check it every five minutes,
and act if something went red.

So the loop was set — `/loop 5m check the deploy and tell me what happened` — and
the laptop was closed while everyone went to lunch. Thirty minutes later it was
opened again, and nothing had run. Not the checks, not one of them.

Two things had been assumed that were not true. The first is that a loop is a
daemon. It is not: a scheduled task fires **while the session is open**, so
closing the terminal stops it firing, exactly as it stops the session. The second
is that a missed fire is made up later. It is not: a task whose time passed while
Claude was busy fires **once** when Claude next goes idle, not once per missed
interval.

That second one is the subtle one, because it is invisible on a quiet day. Set a
loop, do nothing, and every iteration appears. Give the session one long request
that spans three iterations and you get one fire, and no message telling you that
two were skipped.

Separately: a loop that had been running for a fortnight had quietly stopped some
time in its second week. Recurring tasks expire seven days after creation — they
fire a final time, then delete themselves.

---

## The Concept

Three ways to put Claude Code on a schedule. They are not variations of each
other; they run in different places and survive different things.

| | Cloud routines | Desktop scheduled tasks | `/loop` (this lesson) |
|---|---|---|---|
| Runs on | Cloud, Anthropic-managed by default | Your machine | Your machine |
| Machine must be on | No | Yes | Yes |
| Session must be open | No | No | **Yes** |
| Survives a restart | Yes | Yes | Restored on `--resume`, with exceptions |
| Access to local files | No (fresh clone) | Yes | Yes |
| MCP servers | Configured per task | Config files and connectors | Inherits from the session |
| Permission prompts | None — runs autonomously | Configurable per task | Inherits from the session |
| Minimum interval | 1 hour | 1 minute | 1 minute |

The column that decides most cases is "session must be open". `/loop` is the one
for polling *during* work you are doing. Everything durable is elsewhere, and
that is Phase 17's territory.

### Three shapes of `/loop`

What you pass decides which of these you get.

| You provide | What happens |
|---|---|
| An interval and a prompt — `/loop 5m check the deploy` | Your prompt runs on a fixed cron schedule |
| A prompt only — `/loop check the deploy` | Claude picks a delay between one minute and one hour after each iteration, based on what it saw. It prints the delay and the reason |
| An interval only, or nothing — `/loop` | The built-in maintenance prompt runs, or your `loop.md` if one exists |

Intervals take `s`, `m`, `h`, and `d`. Seconds round up to the nearest minute,
because cron has one-minute granularity. Intervals that do not map to a clean
cron step — `7m`, `90m` — are rounded to the nearest one that does, and Claude
tells you which it picked.

You can pass a skill as the prompt — `/loop 20m /review-pr 1234`. A scheduled
fire only runs skills Claude is **allowed to invoke on its own**. Built-in
commands like `/permissions` or `/clear`, skills marked
`disable-model-invocation: true`, and MCP prompts all arrive as plain text
instead.

### One-shot reminders are the same machinery

```
remind me at 3pm to push the release branch
in 45 minutes, check whether the integration tests passed
```

Claude pins a fire time with a cron expression, creates a single-fire task, and
the task deletes itself after it runs.

Underneath all of it are three tools: `CronCreate` (a five-field cron expression,
the prompt, and whether it recurs), `CronList`, and `CronDelete`. Each task has
an eight-character ID, and one session can hold up to 50.

### How a scheduled fire actually happens

The scheduler checks every second and queues due tasks at low priority. A
scheduled prompt fires **between your turns**, never mid-response. If Claude is
busy when a task comes due, the prompt waits for the turn to end.

All times are local. `0 9 * * *` is 9am wherever you are, not UTC.

And fire times are shifted on purpose. If every session ran its tasks exactly on
schedule, they would all hit the API in the same instant, so:

- A recurring task starts each run **late** — up to half the gap to its next run,
  and at most 30 minutes. Hourly and daily tasks are at the top of that range
- The exception is a task written `*/5 * * * *`, which is what `/loop 5m` creates.
  That one starts 15 seconds *early*, because a run exactly five minutes later
  would begin just after a five-minute prompt cache expired
- A one-shot task scheduled for `:00` or `:30` runs up to 90 seconds early

`CronList` shows a `next run` time, which is the only sane way to know what
you actually got.

### The two things that bound a loop

**Seven days.** A recurring task expires seven days after creation. It fires one
final time and deletes itself. To go longer, cancel and recreate before it
expires, or use a cloud routine.

**No catch-up.** Missed fires are not replayed. One fire when the session next
goes idle, not one per missed interval.

Both of these are brakes on a forgotten loop, and both of them mean the loop
cannot be your reliability mechanism.

### Writing your own default prompt

A bare `/loop` uses a built-in maintenance prompt unless a `loop.md` exists:

| Path | Scope |
|---|---|
| `.claude/loop.md` | Project. Takes precedence |
| `~/.claude/loop.md` | User. Applies wherever the project has no file |

It is plain Markdown with no required structure — write it as if you were typing
the prompt. It defines one default prompt for bare `/loop`, not a list of tasks,
and it is ignored whenever you supply a prompt on the command line. Edits take
effect on the next iteration, so you can steer a loop while it runs. Content past
25,000 bytes is truncated, so keep it tight.

> **The reframe:** a loop is a timer bound to a live session rather than a
> daemon — it fires between your turns, it cannot catch up on what it missed, and
> it deletes itself after seven days, so it buys you fewer *keystrokes*, not
> uptime.

---

## Build It

### 1. Start with the smallest loop: one fire

```
in 2 minutes, tell me the current git branch and whether the tree is clean
```

Then:

```
what scheduled tasks do I have?
```

✅ You pass when `CronList` shows a single-fire task with a `next run` time, and
the task is gone from the list after it fires.

### 2. Fixed interval

```
/loop 5m check whether CI passed and tell me what happened
```

✅ You pass when Claude confirms a cadence and a job ID, and `CronList` shows the
schedule as a cron expression rather than as `5m`.

### 3. Let Claude choose the interval

```
/loop check whether CI passed and address any review comments
```

Read the end of the first iteration. A dynamically scheduled loop prints the
delay it chose and why.

✅ You pass when you can say what Claude saw in the first iteration that made it
pick the delay it picked.

### 4. Prove no catch-up

This is the experiment the opening incident is about. Set a short interval, then
immediately give the session a request that takes several intervals to finish —
something genuinely long, not a sleep. Count the fires while it runs, then count
what arrives when the turn ends.

✅ You pass when you can state how many fires were due, how many actually
happened, and which behaviour that demonstrates rather than a bug.

### 5. Stop it two ways

For a self-paced loop, press `Esc` while it is waiting for its next iteration.

Then, for a loop you created by asking Claude directly, cancel it by ID:

```
cancel the deploy check job
```

✅ You pass when `Esc` clears a pending wakeup without touching your other
scheduled tasks, and `CronDelete` removes the one you named.

### 6. Own the default prompt

Create `.claude/loop.md` in this repo:

```markdown
Check the current branch's pull request. If CI is red, pull the failing job log,
diagnose, and push a minimal fix. If new review comments arrived, address each
one and resolve the thread. If everything is green and quiet, say so in one line.
```

Run a bare `/loop`. While it is waiting for its next iteration, edit the file.

✅ You pass when the next iteration reflects the edit, and you can say where the
project file wins over the user file.

### 7. Prove session scope, and then check what comes back

Two halves, and the second one is the interesting half.

First: with a loop running, close the session. Reopen it. Nothing is firing.

Second: restart with `claude --resume`. Now ask what tasks you have.

✅ You pass when you can name which of your tasks came back and which did not —
and specifically whether a self-paced loop returned.

> Ordering, jitter, and the seven-day expiry are all version-gated, and the
> jitter numbers in particular have been tuned more than once. Verified against
> [the scheduled tasks page](https://code.claude.com/docs/en/scheduled-tasks) on
> 2026-10-15. Check `https://code.claude.com/docs/llms.txt` before you promise
> anyone a fire time.

---

## Use It

| Need | Reach for | Why not the next thing |
|---|---|---|
| Poll a deploy for the next hour | `/loop 5m <prompt>` | Predictable cadence, and you are at the keyboard |
| Babysit a PR with irregular activity | `/loop <prompt>`, no interval | Claude stretches the delay when nothing is happening |
| Leave a standing prompt for bare `/loop` | `.claude/loop.md` | Defines the default, not a list of jobs |
| One reminder | Natural language | A single-fire task that deletes itself |
| Something that must survive next week | A cloud routine, or Desktop tasks | `/loop` expires in seven days and needs an open session |
| React to an event rather than polling | Channels | A push beats a timer for anything that has a real signal |
| Keep working until a condition holds | `/goal` | Condition-based persistence, not an interval |
| Stream a long script's output | The Monitor tool | Avoids polling altogether when one is available |
| See what is scheduled | `what scheduled tasks do I have?` | `CronList` under the hood, with IDs |
| Turn scheduling off entirely | `CLAUDE_CODE_DISABLE_CRON=1` | Disables the tools and stops pending tasks |

---

## Exercises

1. Set a fixed loop with an interval that does not map cleanly to cron — `7m` —
   and read what Claude says about the interval it actually chose.
   ✅ You pass when you can name the cadence it picked and why yours was not
   representable.

2. Run a self-paced loop for three iterations and record the delay and reason
   from each. Then change the thing it is watching — make CI go red, or leave a
   review comment — and record the next delay.
   ✅ You pass when you can point at the observation that changed the delay.

3. Predict, in writing, which of your scheduled tasks survive a `--resume` and
   which do not. Then run it and compare.
   ✅ You pass when your prediction matches the docs and the observation, or your
   note explains the rule you had backwards.

4. Take one job you currently poll by hand and decide, with reasons, between
   `/loop`, `/goal`, and a cloud routine.
   ✅ You pass when the deciding reason is about where the work runs and what has
   to be open — not about which command you already know.

5. A task is due at 9:00. The session is idle at 9:00 and again at 10:00. For an
   hourly task, write down when it actually fires and how long that is after
   9:00.
   ✅ You pass when your answer is inside the documented range and you can say
   which direction the shift goes.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| `/loop` | "a cron job" | A session-scoped scheduled prompt. Fires between your turns while the session is open |
| scheduled task | "the timer" | A `CronCreate` entry with an 8-character ID, a 5-field cron schedule, and a prompt. Max 50 per session |
| self-paced loop | "the smart one" | A `/loop` with no interval. Claude chooses 1–60 minutes after each iteration and prints why |
| `loop.md` | "the config" | The default prompt for bare `/loop`. Project file wins over user file. Truncated past 25,000 bytes |
| catch-up | "it'll run late" | It will not. Missed fires collapse to one when the session next goes idle |
| jitter | "the drift" | A deliberate shift so sessions do not hit the API together. Recurring tasks run late; `*/5` runs 15s early |
| seven-day expiry | "the limit" | A recurring task fires a final time and deletes itself seven days after creation |
| `Esc` | "stop the loop" | Clears a self-paced loop's pending wakeup. Does not affect tasks you asked for directly |
| cloud routine | "the durable one" | A schedule that runs without your machine or session. Phase 17 |

---

## What this lesson skipped

**Cloud routines and Desktop scheduled tasks in depth.** The comparison table
above is the decision; the configuration is Phase 17, along with `--schedule`
and the GitHub Actions path.

**Channels.** The event-driven answer to "stop polling". Lesson 83 shows where
it sits next to hooks; the MCP contract behind it is Phase 17.

**`/goal` in detail.** Keeping Claude working toward a condition is a different
mechanism with its own stopping rules — a model judges it impossible, or an error
you must fix clears it. Worth knowing it exists so that you do not reach for a
one-minute loop to express a condition.

**The Monitor tool.** When it is available, a self-paced loop may use it to stream
a script's output instead of polling. That is a token-efficiency choice, and it
is documented on the tools reference rather than here.

**Cron expression syntax beyond five fields.** `L`, `W`, `?`, and name aliases
are not supported. When both day-of-month and day-of-week are constrained, a date
matches if *either* matches — standard vixie-cron behaviour, and a genuine trap if
you are used to a different cron.
