# Plan Mode and Checkpoints

> Plan mode is a permission context, not a different model — the tool can read
> and think, but not act.

**Type:** Learn
**Prerequisites:** Lesson 34 (Settings)
**Time:** ~25 minutes

While you are in plan mode, the tool is doing its thinking out loud, in front of you. You read it, ask questions, push back, and approve when the plan is right.

## The Concept

Plan mode is not a separate model. It is not a "smarter" mode. It is a sandbox over tools.

In plan mode:

- The tool can read files.
- The tool can search the web, if it would in normal mode.
- The tool can run read-only commands.
- The tool cannot edit files without your say-so.
- The tool cannot run side-effecting commands without your say-so.

The tool, if asked, will produce a written plan. The plan is just a normal response from the tool, formatted as steps. There is no special syntax.


## Build It

For this conceptual lesson, the work is one short scenario in a Claude Code session to confirm the section landed:

1. Open a fresh session in any project folder.
2. Apply the idea in the section above to your project in a way that fits.
3. Notice what happens when the condition in the section is met, and when it is not.

Pass: you can describe the difference between the two cases in one paragraph.
## How a plan gets out of plan mode

When you are happy with the plan, you tell the tool to execute it. That is the gate. The tool does not sneak out by itself.

How you tell it varies: a phrase like "go" or "do it" or "proceed." The exact phrasing is not the lesson here. The mental model is: the plan is a proposal, you are the approver.

If the plan is wrong, you do not approve it. You tell the tool what is wrong with the plan. The tool revises.

## What "checkpoints" means here

A checkpoint is a saved state of the session — the conversation, the files the tool has read, the in-flight state — at a moment when things were good. You can return to that state.

Two related ideas:

- The tool creates checkpoints at meaningful moments (after a successful action, on a unit boundary).
- You can ask to rewind to a checkpoint if later steps went sideways.

For now, just hold the word: a checkpoint is a saved "we were good here." Lesson 36 will show the mechanics.

## Learning Objectives

By the end of this lesson you can:

- Name what plan mode allows and what it does not
- Tell the difference between plan mode and normal mode at the tool level
- Decide when to enter plan mode and when to skip it
- Approve or reject a plan based on what the tool wrote
- Define a checkpoint and say when one is created

## The Problem

You ask for a multi-file refactor. The tool dives in. Five minutes later, it has touched eight files and the tests are failing. You wanted to see the plan first.

The plan exists in the tool's head. It could have written it out before acting. In normal mode, it acts. In plan mode, it writes first. The lesson exists to make that choice visible: you can ask the tool to plan before it acts, and the cost of doing so is small.

## When to use plan mode

Use plan mode when:

- The change touches multiple files.
- The change is hard to reverse.
- You want to see the tool's reasoning before it acts.
- The task has unknowns the tool might guess at.

Skip plan mode when:

- The task is a one-line fix.
- The task is well-known and reversible.
- You asked for a tool call, not a plan.

## The reframe

**The reframe:** Plan mode is not the tool being careful. It is the tool being told the cost of mistake is high, and it will respond with a slower but more deliberate plan.

In normal mode, the tool tries to act quickly and correctly. The cost of a mistake is borne by you, in reverts and re-dos. In plan mode, the cost of a wrong plan is just a re-write. The tool is being told: do not act yet, but think in front of me.

A useful analogy. Plan mode is the difference between a contractor saying "I'll start tomorrow" and the contractor saying "here is what I will do Tuesday." Same contractor. Different cost framing.

## A worked example

You ask: "add error handling to all the API routes."

In normal mode the tool goes: reads the routes, edits each one, runs the tests. Fast, but you cannot see the plan before it is run.

In plan mode the tool goes: reads the routes, writes a plan that names each route and the pattern it would add, asks you to approve. Slow, but you can read the plan, see that the tool has missed two routes, point that out, and approve the revision.

The tool that produced the plan and the tool that would have done the work are the same. The mode changed which verbs were allowed.

## Three practical consequences

**1. Plan mode is cheap.** Switching into and out of it does not cost much. If unsure, go in.

**2. The plan is editable.** When you read it, you will see things to change. That is normal.

**3. Approval is the gate, not the duration.** The tool exits plan mode when you say so, not when the plan reaches some length.

## Use It

| Situation | Use plan mode? |
|---|---|
| Rename a single function | Probably not — the change is small and local |
| Add error handling to all routes | Yes — the change is multi-file, and the plan is short to read |
| Add a new dependency and import it everywhere | Maybe — depends on how widespread the imports are |
| Reformat a single file | No |
| Reformat the whole project | Yes — you want to see the plan, then pick files |
| Write a SQL migration that the tool will run | Yes — destructive, hard to reverse |

## Exercises

1. **See how a plan differs from auto-execution.**
   In any project with at least three source files, enter plan mode. Ask: "refactor the imports across all source files."
   Pass: the plan names each file in the project, or you pushed back once and the plan now names them. The plan is in front of you before any edit happens.

2. **Approve a plan and watch it execute.**
   Enter plan mode. Ask for a small change. Read the plan. Approve. Watch the tool execute the plan.
   Pass: every step the tool takes during execution matches a step in the plan you approved. If the tool does something the plan did not list, push back: that was outside the plan.

3. **Reject a plan on purpose.**
   Enter plan mode. Ask for a non-trivial change. Reject the plan with a specific reason.
   Pass: the tool produces a revised plan that addresses your reason. You can name what changed between the first and the second plan.

## Key Terms

| What people say | What it actually means |
|---|---|
| "It's in plan mode, why isn't it doing anything?" | Plan mode is a sandbox over edits and side-effecting commands. The tool can read and think. Acting requires your approval. The misconception is that plan mode is a different model. It is a different permission context. |
| "I want a plan." | Use plan mode. Read the plan. Push back if it is wrong. Approve only when it is right. |
| "Checkpoint." | A saved session state from a moment when things were good. You can return to it. Lesson 36 has the details. |
| "Approve." | The signal that tells the tool to leave plan mode and act. You are the gate. |

## What this lesson does not cover

We did not show the key bindings for entering or exiting plan mode. We did not talk about checkpoint storage or the rewind UI. Those are Lesson 36.

This lesson was about plan mode as a permission context, not a different tool.
