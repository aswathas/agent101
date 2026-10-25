# Anatomy — the Frontmatter Field Table

> You can pick a field for a reason, write a `description` that makes a skill
> fire, and diagnose the two failure modes that look identical from the outside.

**Type:** Learn
**Prerequisites:** Lesson 40, What a Skill Is
**Time:** ~40 minutes

---

## Learning Objectives

- Write valid frontmatter and know which line is load-bearing
- Choose fields deliberately instead of pasting a header someone else wrote
- Write a `description` in terms of *when to use*, not *what it does*
- Tell the two silent failure modes apart: bad name, bad YAML

---

## The Problem

You wrote a skill. `/my-skill` works. Your colleague tries it — it doesn't fire.
You try asking Claude to do the thing naturally, without the slash. Nothing.

Then you run it manually and it is perfect. So the content is fine, the
instructions are fine, and the skill is broken in a way that produces **no error
at all**.

Two different causes produce that identical silence:

1. The **description** describes what the skill *is* instead of when to use it,
   so it never matches the words a person actually types.
2. The **YAML is malformed**, so Claude Code loads the body with empty metadata —
   `/name` still works, but there is nothing for the model to match against.

Case 2 is the cruel one. A skill with a broken header looks *healthy*: the
command is in the menu. You spend an hour improving the description while the
YAML stays broken. You need `--debug` to see either.

---

## The Concept

Frontmatter is the YAML block at the **top** of `SKILL.md`. The opening `---`
must be the **first line** — no shebang, no comment, no blank line above it.

```markdown
---
name: deploy
description: Deploy the application to staging. Use when the user says deploy, ship, or release, or asks to push to the staging environment.
---

Run the tests, build, and deploy. Verify before reporting success.
```

Markdown instructions follow the closing `---`. **All fields are optional.**
`description` is the recommended one.

### The field table

Counted from the reference table on **2026-10-15**. It listed **20 fields**. The
catalog calls this the "21-field" table, and I would rather say so than invent a
twenty-first: check the page and count them yourself. The list moves.

| Field | Controls |
|---|---|
| `name` | The command you type. Defaults to the directory name. |
| `description` | What it does **and when to use it**. Drives automatic invocation. |
| `when_to_use` | Extra trigger phrases / example requests. Appended to `description`. |
| `argument-hint` | What autocomplete shows, e.g. `[issue-number]`. |
| `arguments` | Named positional arguments for `$name` substitution. |
| `disable-model-invocation` | `true` = Claude may never auto-load it. You still can. |
| `user-invocable` | `false` = hidden from `/`, won't run when typed. Claude still can. |
| `allowed-tools` | Tools usable without asking **during that turn only**. |
| `disallowed-tools` | Tools removed from the pool while the skill is active. |
| `model` | Model for the turn. `inherit` keeps the session model. |
| `effort` | `low`/`medium`/`high`/`xhigh`/`max`. Available levels depend on the model. |
| `context` | `fork` runs it in a forked subagent context (Phase 06). |
| `agent` | Which subagent type, when `context: fork`. |
| `background` | With `fork`: `false` waits for the result. |
| `hooks` | Hooks registered on invoke, kept for the session (Phase 08). |
| `paths` | Globs that limit auto-activation to matching files. |
| `shell` | `bash` (default) or `powershell`, for inline shell blocks. |
| `metadata` | Free-form map for your own tooling. Claude Code does not act on it. |
| `license` | Agent Skills spec field. Accepted, not acted on. |
| `compatibility` | Agent Skills spec field. Accepted, not acted on. |

Booleans accept `yes`, `no`, `on`, `off`, `1`, `0` as well as `true`/`false`.
Legacy command files accept everything **except** `name` and `paths`.

`description` + `when_to_use` combined is truncated at **1,536 characters** in the
listing — put the key use case first.

### The four that earn their place

Everything else is situational. These are the ones that change behaviour you
depend on.

**`description`** — the only field that decides whether the skill exists for
this request. The failure mode is writing *what it is*:

> ✗ "A skill for deployment. Runs tests, builds, and deploys."

vs *when to use it*:

> ✓ "Deploy the application. Use when the user says deploy, ship, or release,
> or asks to push to the staging environment."

The second contains the words people type. The first contains words only its
author would type.

**`disable-model-invocation: true`** — for anything with side effects:
deploying, committing, sending mail, deleting. Its description is also removed
from the model's available-skill context, so you stop paying listing cost for
something that must never fire on its own.

**`allowed-tools`** — pre-approve tools for the invoking turn. Phase 04's
permission model is what this reaches into; the grant clears on your next
message, and it never persists.

**`paths`** — auto-load only when working with files matching the globs. Same
format as path-scoped rules. This is the cheapest way to keep a skill's
listing honest about when it applies.

> **The reframe:** frontmatter isn't metadata *about* the skill, it is the only
> text Claude reads before deciding the skill should exist — so a skill that
> won't fire is almost always a contract problem, not a content problem.

### The two silent failures

| Symptom | Cause | Where to look |
|---|---|---|
| `/name` works, model never auto-loads | Description doesn't contain the words people type | The `description` line |
| `/name` works, model never auto-loads, description looks fine | Malformed YAML — body loaded, metadata empty | `claude --debug`, look for the parse error |
| Skill missing from the `/` menu entirely | The **name** holds a refused character | `claude --debug`, grep the log for `[names]` |

The middle row is the one that burns the afternoon. If the description is good
and it still doesn't fire, stop improving words and go read the log.

Refused name characters include zero-width and control characters, private-use
glyphs, bidi direction characters, any whitespace that isn't a single plain
space, and `<` or `>`.

To find `SKILL.md` files whose frontmatter doesn't parse, run
`claude plugin validate .claude/skills` (needs Claude Code v2.1.233 or later).
The minimum version check is why this lesson dates its claims — check
[current docs](https://code.claude.com/docs/en/skills) before quoting it back.

---

## Build It

### 1. Write the header from nothing

Create a skill with **only** `description`. Run it. Confirm it works with no
other fields.

✅ You pass when `/name` runs and you can say which fields were absent.

### 2. Add one field, observe one change

Add `argument-hint`. Type `/name ` and watch autocomplete. Then add `arguments`
and pass a real value through.

✅ You pass when you can show the hint appearing, and a substituted value
reaching the body.

### 3. Break the YAML on purpose

Add a stray colon-space inside the `description` value so it stops being valid
YAML. Run with `claude --debug`, and try both `/name` and a natural request.

✅ You pass when you can report all three: whether `/name` still works, whether
automatic invocation died, and the parse error the log showed.

### 4. Write two descriptions, measure which fires

Take one skill. Version A: "A helper for the deploy process." Version B: the
when-to-use phrasing. Try three realistic natural requests against each, in
fresh sessions.

✅ You pass when you have six results and at least one request where A fired and
B did not, or vice versa.

### 5. Make it manual and confirm the listing shrinks

Add `disable-model-invocation: true`. Run `/context` before and after.

✅ You pass when you can say whether the listing cost went down, and that `/name`
still works.

### 6. Scope it to a path

Add `paths: "**/*.ts"`. Ask for something that matches, then something that
doesn't.

✅ You pass when you can point at one request where it fired and one where it
didn't, and the difference is the glob.

---

## Use It

| Field | When you reach for it |
|---|---|
| `description` | Always. First and last line you edit on a skill that won't fire. |
| `when_to_use` | When `description` is getting long and you want examples kept separate |
| `disable-model-invocation` | Any side-effecting skill |
| `user-invocable: false` | Background reference knowledge the user should never type |
| `allowed-tools` | A skill that would otherwise prompt mid-run |
| `disallowed-tools` | A background skill that must never ask the user anything |
| `paths` | A skill that only makes sense for certain files |
| `argument-hint` / `arguments` | Any skill that takes input |
| `model` / `effort` | Rare. Know they exist; leave them alone by default |
| `context` / `agent` / `background` | Phase 06 |
| `hooks` | Phase 08 |
| `metadata` | Your tooling reads it, Claude Code does not |

---

## Exercises

1. Take a skill that doesn't fire. Change **only** the `description`. Report
   before and after.
   ✅ You pass when you can say what words were missing, quoting the actual
   request that should have matched.

2. Produce a skill that fails silently. Submit which of the two silent modes you
   produced, the debug output that identified it, and the fix.
   ✅ You pass when the identification is right and the fix is one line — a
   valid header plus a better description.

3. Audit the frontmatter of every skill you own. Mark each field used and each
   field there "because I copied a template".
   ✅ You pass when the copied-without-reason fields are deleted, and you can
   say which one deletion changed behaviour and which changed nothing.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| frontmatter | "metadata" / "the YAML header" | The only text read before the decision to load. It is a contract, not a label. |
| `description` | "a summary" | The match target. Needs the words a human would type. |
| 1,536-character cap | "it's too long" | Per-entry truncation of `description` + `when_to_use` in the listing. |
| silent failure | "it's broken" | Two different causes, one appearance. `--debug` is the only way to tell. |
| refused name | "bad skill" | A character in the name Claude Code will not accept. `[names]` in the debug log. |
| `inherit` | "use the session model" | The literal value that means "don't override". |

---

## What this lesson skipped

**Invocation control as a system.** `disable-model-invocation` and
`user-invocable` are two independent switches, not one flag. Lesson 42.

**String substitutions.** `$ARGUMENTS`, `$1`, `$2` and the `arguments` field were
named. Lesson 44 shows them working.

**Dynamic context injection.** `` !`command` `` and ```` ```! ```` blocks. Not
in the field table because they're markdown syntax, not frontmatter.

**Subagent fields** (`context`, `agent`, `background`) and **`hooks`**. Named
for shape only. Phase 06 and Phase 08.

**Plugin skill prefixing.** A plugin skill's name is namespaced
(`/my-plugin:review`). Phase 09.