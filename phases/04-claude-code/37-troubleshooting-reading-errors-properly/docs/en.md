# Troubleshooting — Reading Errors Properly

> The error message is the first source of information when something goes
> wrong. Reading it carefully is the skill.

**Type:** Learn
**Prerequisites:** Lesson 36 (Checkpointing, /rewind, Recovery)
**Time:** ~25 minutes

This lesson is short and specific. There are four habits. Each one is a thing you can do at the moment of an error, not a thing you do later.

## The Concept

The default failure mode, for most people, is:

1. See the error.
2. Skim.
3. Guess at the cause.
4. Try a fix.
5. Try another fix.
6. Try five more.
7. Finally read the error.

Step 7 is where most debugging time goes. Cut it out.


## Build It

For this conceptual lesson, the work is one short scenario in a Claude Code session to confirm the section landed:

1. Open a fresh session in any project folder.
2. Apply the idea in the section above to your project in a way that fits.
3. Notice what happens when the condition in the section is met, and when it is not.

Pass: you can describe the difference between the two cases in one paragraph.
## Habit 1: read the first line and the last line

Errors have a beginning, middle, and end. The middle is often stack frames or context. The first and last lines are usually the actual statement of the problem.

Example shape:

```
Error: cannot read property 'foo' of undefined
    at Object.<anonymous> (/path/to/file.js:42:17)
    at Module._compile (...)
    ...
  status: 'failed',
  hint: 'check that the user object is loaded before this call'
```

The first line says what. The last line says what to do.

Read both, slowly, out loud if it helps.

## Habit 2: read the path and the line number

Errors usually point at a file and a line. Open that file. Go to that line. Look at the context around it. Most errors are local. Most errors that look global are local at the line in the error.

If the line number is missing, the error message is hiding it. That is itself information: the tool cannot tell where the failure is.

## Habit 3: read what the tool said before the error

The tool often prints a header or a status above the actual error. Like:

```
Running tests...
Failure: 3 tests failed.
[error here]
```

The line right above the error — and the line right above that — is what the tool was doing when it failed. If you only read the bottom, you miss the prelude.

## Habit 4: ask the tool to read the error for you

If the error is from the tool itself (it tried to use a tool and got a failure back), you can ask the tool to interpret it. Paste or quote the error back to it. Say: "what does this tell you?"

The tool can usually restate the error in plainer words, point at the file, and suggest the next step. Use this. The tool is good at the very thing you may be bad at: reading errors carefully.

## Learning Objectives

By the end of this lesson you can:

- Read the first and last lines of an error and name what each tells you
- Open the file at the line the error points to and read the context
- Ask the tool to interpret an error you do not understand
- Stop guessing at fixes and start with the error text

## The Problem

Something failed. You see a wall of error text. You close it and try a fix. The fix does not work. You try another. An hour later, you are still guessing.

The wall of text was telling you what was wrong. The lesson exists to make that wall of text the first thing you read, not the last.

## The reframe

**The reframe:** Most "the tool is broken" reports are "I did not read the error." Read it. The error tells you what to do next.

If a fix the tool suggested did not work, that is also a report. Did the suggestion match the error's first and last lines? If not, the suggestion was a guess. Try the next habit above, not the next guess.

## A worked example

Symptom: tests fail. Tool output looks like a wall of text.

What you do:

1. Scroll to the bottom. Read the last line.
2. Scroll to the top of the failing test's output. Read the first line.
3. Find the file and line in the message.
4. Open that file. Look at the line.
5. If still unclear, ask the tool: "read this error and tell me what to do next."

Total time: under two minutes, usually.

Total time without the habits: twenty minutes of poking, more likely.

## Three practical consequences

**1. Slow down on the first error.** Speed up on the rest. Errors cluster. One real cause, several symptoms.

**2. Errors lie, but only a little.** Read them as the tool's best guess about what happened. Re-verify if the fix does not work.

**3. The error is data.** Save it. Quote it. Search for it. Send it to the tool. Do not retype.

## Use It

| Situation | Do this first |
|---|---|
| See an error you do not understand | Read the first and last lines, out loud |
| See a path and line in the error | Open the file at that line, read the context |
| See a long stack trace | Read the first and last lines; ignore the middle for now |
| The tool suggests a fix that did not work | Check whether the suggestion matches the error text; if not, you are guessing |
| You have spent ten minutes on the same error | Stop. Read the error. If still stuck, paste it back to the tool |

## Exercises

1. **Read an error properly without guessing.**
   In any folder, run a known failing test or command. If you do not have one, write a small test that fails on purpose. Read the entire error block. Slowly.
   Pass: you can name the first line, the last line, the file and line, and the suggested action if any — without looking back at the error.

2. **Find the local context.**
   Take an error that points to a file and line. Open the file. Read the five lines around the line the error named.
   Pass: the error makes sense in the context. Either you can name a fix, or you can name what you would ask the tool about.

3. **Send the error back to the tool.**
   Find a real error from a real session. Paste it back to the tool and ask: "what does this tell you?"
   Pass: the tool's response names a file, a line, and a probable cause. The response is grounded in the error text, not a guess.

## Key Terms

| What people say | What it actually means |
|---|---|
| "The tool is broken." | Almost never. The tool produced an error and you did not read it. The misconception is that errors are noise. They are information. |
| "Stack trace." | The middle of an error. The first and last lines are the actual statement. |
| "Logs." | The same rules as errors: first line, last line, file path, line number. Same habits. |
| "What to do next." | Usually stated in the last line of an error, or two lines above. Read there. |

## What this lesson does not cover

We did not cover specific error formats for specific tools. We did not cover how to attach debuggers or step through code. We did not cover how to read stack traces in languages we did not mention.

This lesson was about the four habits and the one reframe: read the error.
