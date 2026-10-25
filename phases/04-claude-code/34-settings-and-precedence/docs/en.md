# Settings — 4 Files, 5 Precedence Levels

> Four files plus a flag, in five layers, with a fixed rule for collisions.

**Type:** Learn
**Prerequisites:** Lesson 33 (Permissions and Permission Modes)
**Time:** ~30 minutes

When a setting looks wrong, the cause is almost always that a higher layer overrode your edit. The fix is to check, not to edit harder.

## The Concept

Settings are checked in this order. The first layer that sets a key wins for that key. Lower layers are still read for keys the upper layer did not set.

| Layer | File or flag | What it is | When to edit it |
|---|---|---|---|
| 1. Managed | set by your organization or admin | Out of your hands in this course. | Don't. |
| 2. Flag | `--settings <path>` passed on the command line | A file you point at for a single launch. | When you want one-off behavior. |
| 3. Project-local | `.claude/settings.local.json` in the project | Per-machine, per-project, not committed. | Personal overrides in a shared repo. |
| 4. Project-shared | `.claude/settings.json` in the project | Committed with the project. Affects everyone. | Rules the project wants for everyone. |
| 5. User | `~/.claude/settings.json` in your home directory | Your defaults across all projects. | Things you want everywhere. |

Read the table from the bottom. Lower numbers win. Layer 1 wins over everything. Layer 5 is the floor.


## Build It

For this conceptual lesson, the work is one short scenario in a Claude Code session to confirm the section landed:

1. Open a fresh session in any project folder.
2. Apply the idea in the section above to your project in a way that fits.
3. Notice what happens when the condition in the section is met, and when it is not.

Pass: you can describe the difference between the two cases in one paragraph.
## The rule for collisions

Two layers can each try to set the same key. What happens depends on the type of the value:

- **Scalars.** Strings, numbers, booleans, null. The higher layer replaces the lower one. Last write wins, in the order top to bottom.
- **Arrays.** Lists. The higher layer's arrays are merged into the lower layer's. Duplicates can be removed; the gist is: arrays combine, scalars replace.

This is the one rule worth memorizing. If you remember nothing else from this lesson, remember:

**Arrays merge. Scalars are replaced.**

## Learning Objectives

By the end of this lesson you can:

- Name the five layers settings live in
- Predict which file will win when two layers disagree
- Tell whether a given key combines or replaces
- Find the layer that is overriding your edit
- Decide which layer to edit for a given change

## The Problem

You change a setting in the project-shared file. Nothing happens. You change it again, harder. The setting still does not move. The tool is ignoring you.

The tool is not ignoring you. A higher layer has a value, and that value is winning. You are editing the layer that loses. The lesson exists to make the layer ordering visible and the fix obvious.

## Where to edit what

Most of the time you have two questions:

1. Should this rule live with the project or with me?
2. If with the project, should it be committed?

- Things only you want, on this machine: layer 3, the project-local file. Keep it uncommitted.
- Things the project wants for everyone: layer 4, the project-shared file. Commit it.
- Things you want across every project: layer 5, the user file.
- One-off, this launch only: layer 2, the `--settings` flag.

If you cannot decide, start at the project-shared layer. Commit it. See how it goes.

## A worked example

Suppose you want the tool to avoid reading environment files in your current project. You add a deny rule to the project-shared settings file:

```json
{
  "permissions": {
    "deny": ["Read(.env)"]
  }
}
```

It does not work. Why?

Because somewhere higher in the stack — managed, flag, or project-local — the same key is set to something else. Or `permissions.deny` is being merged, and a higher layer has it set to `[]`, which clears the list. Open the higher file and look. Or run with the layer you care about alone.

The fix is rarely to edit harder. The fix is to find the higher layer.

## The reframe

**The reframe:** A setting that does not behave as you expect is almost always coming from a layer you did not edit. The fix is to check, not to edit harder.

When this happens, you have two choices:

1. Open the higher file and remove the override.
2. Move your edit up to that higher file, if it is yours to edit.

Picking "edit harder" at the same layer is a slow way to lose.

## Three practical consequences

**1. New project? Start at layer 5.** Put your defaults in the user file. They apply everywhere.

**2. Shared project? Use layer 3 for personal overrides.** The shared file at layer 4 is the project's call.

**3. Something is off? Run from a clean room.** Start the tool with only the user file in scope. See if the problem goes away. If it does, the override is in a project file or was passed via a flag.

## Use It

| Situation | Edit this layer |
|---|---|
| You want a default behavior everywhere you work | 5 — User |
| You want a personal override for one project | 3 — Project-local |
| The project should enforce a rule for everyone | 4 — Project-shared |
| You are testing a one-off config | 2 — Flag |
| The tool's behavior is being controlled by your org | 1 — Managed. Talk to your org. |

## Exercises

1. **See precedence with your own eyes.**
   Open any folder. Ask the tool what permission mode it is using. Note the answer.
   Pass: you can name the layer that is currently setting the answer, by reading the table top to bottom until you find a layer that has a value for that key.

2. **Set a value at two different layers and watch who wins.**
   Set a setting in the user file. Open a session and check. Set the same setting to a different value in the project-shared file. Open a session and check.
   Pass: the second session shows the project-shared value, not the user value, because the project-shared layer is higher precedence.

3. **Find the override.**
   Make a change that you can detect, in one specific layer. Now make the SAME setting produce a different behavior. Find the higher layer that is doing it.
   Pass: you can name the higher layer by walking the precedence list and reading the file at each level.

## Key Terms

| What people say | What it actually means |
|---|---|
| "My settings are not being read." | A higher layer is overriding them, or your file is at a path the tool does not check. The misconception is that the tool reads every file you create. It checks five specific paths. |
| "Why is this on?" | Most likely, a default is set in the user file or managed file, not a project file. Check those first. |
| "Local vs shared." | The local file is per-machine and not committed. The shared file is committed and affects everyone. |
| "Arrays merge." | Two layers with arrays in the same key combine. Scalars do not combine; the higher one wins outright. |

## What this lesson does not cover

We did not list every key. We did not talk about managed settings in depth. We did not talk about how to debug the resolved settings.

This lesson was about the five layers and one collision rule.
