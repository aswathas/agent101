# Checkpointing, `/rewind`, Recovery

> The undo for a multi-step tool session: roll back to a known good state.

**Type:** Learn
**Prerequisites:** Lesson 35 (Plan Mode and Checkpoints)
**Time:** ~20 minutes

The lesson is short. There is one mechanism, one command, and one rule about when to use it.

## The Concept

A checkpoint is a snapshot of the session at a moment when it was working. It includes:

- The conversation up to that point.
- The files the tool had read.
- The in-flight state of the work.

You do not create checkpoints by hand for the most part. The tool marks one at meaningful seams: after a successful edit, after a green test, after a clean commit. If something goes wrong later, you can return to one of those seams.

If you want to be sure you have a checkpoint, do the work, see the work succeed, and then move on. The checkpoint is already there.


## Build It

For this conceptual lesson, the work is one short scenario in a Claude Code session to confirm the section landed:

1. Open a fresh session in any project folder.
2. Apply the idea in the section above to your project in a way that fits.
3. Notice what happens when the condition in the section is met, and when it is not.

Pass: you can describe the difference between the two cases in one paragraph.
## The undo for the session

When something goes sideways, you reach for a rewind. The function is what matters, not the exact name. You tell the tool: take the session back to a checkpoint. Anything after that checkpoint is gone. The conversation continues from that point.

A rewind is not an undo button for one edit. It is an undo button for many steps at once.

## What a rewind can and cannot do

A rewind can:

- Roll the conversation back to an earlier turn.
- Restore files the tool had read or written.
- Let you start the next step from a clean state.

A rewind cannot:

- Bring back a file you deleted outside the tool (unless the tool had a copy).
- Roll back changes another tool made (out of scope).
- Restore anything the tool itself does not snapshot.

If something happens outside the tool's view, the tool has no checkpoint to rewind to. Rewinds restore tool-state. They do not restore everything.

## Learning Objectives

By the end of this lesson you can:

- Define a checkpoint and say what it contains
- Define a rewind and say what it restores
- Decide when to use a rewind and when to make a manual fix
- Use a rewind and see the conversation roll back

## The Problem

You told the tool to refactor a module. It did. Then it ran the tests. They failed. It tried to fix them. They failed harder. You have lost track of where things went wrong.

The right move is not to debug forward. The right move is to roll the session back to a known good checkpoint and start over. The lesson exists because the most common response to this situation is to keep poking, when a rewind would have been faster.

## When to use it

Use a rewind when:

- The tool edited the wrong file and you want the file back.
- The tool ran tests that mutated state, and you want a clean state.
- You tried an approach, it failed, and you want to try a different one without the failed baggage in the conversation.
- You went down a path and want to start over with what you have learned.

Do not use it when:

- The work is fine and you just want to ask a different question.
- The issue is one paragraph the tool got wrong. Edit the paragraph.

## The reframe

**The reframe:** Checkpointing is the answer to "I should have stopped it earlier." It is the undo for a multi-step tool session, not a single edit.

A single edit, use the editor. Two edits, rewind. Twenty edits and a refactor, definitely rewind. The threshold is "more than one thing to undo."

## A worked example

Scenario. You told the tool to refactor a module. It did. Then it ran the tests. They failed. It tried to fix them. They failed harder. You have lost track of where things went wrong.

Reach for the rewind. Pick the checkpoint from before the refactor started. Conversation is restored. Files are restored. Start over, with the lesson learned: do not let it auto-fix test failures blindly.

## Three practical consequences

**1. Be lazy with rewind.** If in doubt, rewind. It is cheaper than reasoning about partial states.

**2. Rewinds cost conversations.** Anything you wrote in the rewound turns is gone from the conversation. If that text was important, save it elsewhere first.

**3. Rewinds are not magic.** If the tool never read the file, the rewind does not have it. If the file was changed outside the tool, the rewind does not have it.

## Use It

| Situation | Reach for |
|---|---|
| One edit went wrong | Edit the file directly, no rewind |
| A small change produced two cascading failures | Rewind |
| A long refactor went sideways and you cannot see when | Rewind |
| You want to try a different approach from a known-good state | Rewind |
| The conversation has gotten long and full of dead ends | `/clear` instead — rewind does not trim the conversation, just restores state |

## Exercises

1. **Use a rewind and see the conversation roll back.**
   In a folder with one source file, ask the tool to make a small edit, confirm it. Make a second edit, confirm. Make a third edit that is wrong on purpose: change a function name in a way that breaks the file. Stop. Issue a rewind to the checkpoint from step 2. Read the file. Read the conversation.
   Pass: the file is back to its step-2 state, and the conversation no longer contains your step-3 mistake. If the file still has the broken name, you rewound too far or too little — pick a different checkpoint and try again.

2. **Decide rewind-or-edit on purpose.**
   In a session, do one small thing wrong — a typo in a config file, for example. Decide: rewind, or edit?
   Pass: you can name why you chose. A single-line typo in one file is "edit directly." Two wrong files and a confused conversation is "rewind."

3. **Distinguish `/clear` from rewind.**
   Start a session. Do a small task. Run `/clear`. Note what is gone. Then run `/compact`. Note what is gone. Then rewind. Note what is gone.
   Pass: you can name what each one keeps and what each one drops. None of them is the right tool for every problem.

## Key Terms

| What people say | What it actually means |
|---|---|
| "Undo." | Within the tool, yes. Outside the tool, only what the tool snapshotted. The misconception is that rewind restores the whole machine. It restores the tool's session. |
| "Checkpoint." | A saved session state from a moment when things were good. |
| "Rewind." | The act of returning to a checkpoint. |
| "/rewind." | The name of the command. The lesson is about what it does, not the spelling. |

## What this lesson does not cover

We did not show the exact rewind command in detail. We did not list the keybindings. We did not talk about checkpoint retention or storage limits.

This lesson was about the function: undo for multi-step tool sessions.
