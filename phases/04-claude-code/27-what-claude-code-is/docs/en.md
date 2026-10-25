# What Claude Code Is

> A terminal tool that takes a goal, not a completion — and decides its own next
> step.

**Type:** Learn
**Prerequisites:** none — first lesson of Phase 04
**Time:** ~25 minutes

## Learning Objectives

By the end of this lesson you can:

- Open Claude Code from a terminal on your machine
- Give it one instruction in plain English and watch what happens
- Tell another person, in one sentence, why Claude Code is shaped differently from the chat box they have used before
- Name one affordance the terminal version gives you that the chat box does not
- Decide, given a small task, whether Claude Code is the right tool for it

## The Problem

You have used a chat-style AI tool. You type a question, it types an answer, you type the next question. That loop is comfortable. It is also the wrong shape for most of the work you actually do on a computer.

The wrong shape costs you in three places.

First, scope. A chat box can answer about your code. It cannot look at your code. Every conversation starts from what you paste in. Your project, your files, your last test run — none of it is there. You become the courier, shuttling context back and forth.

Second, side effects. A chat box returns text. The work of actually running the test, opening the file, fixing the typo, restarting the server — that is still you. The chat helped you think. You still did the doing.

Third, judgment. When the only thing the tool can do is talk, you start asking it to talk about things it cannot see. The answers start to drift. You stop trusting the output and start trusting the confident tone.

A tool that lives in your terminal, has read access to your project, and can run things on your behalf changes all three. That tool is what the rest of this phase is about.

## The Concept

Claude Code is a program you run from a terminal. Not a website. Not an IDE plugin primarily. Not a chat window with extra buttons. A command you type, like `git` or `grep`, that starts a session you then talk to.

It is built on the same model you may have used in a chat interface. Same brain, different body. The body matters. A terminal program can see your files, run your tests, edit your code, search your repo. A chat box cannot.

The deeper difference is what you give it. A chat interface is completion-shaped: you give it a prompt, it gives you a completion. You write, it writes back. The interaction is text-in, text-out, turn by turn.

Claude Code is agent-shaped. You give it a goal and the tools to pursue it. It decides what to read, what to run, what to write. You tell it the destination. It picks the route. You step in when the route is wrong.

**The reframe:** Claude Code is not a smarter chat box. It is a tool you point at a goal in your project, and the difference is that you give it destinations, not questions.

A small comparison:

| | Chat interface | Claude Code |
|---|---|---|
| Where it runs | Browser tab | Your terminal, in your project |
| What it can see | What you pasted | Your files, your test output, your git status |
| What it can do | Type a response | Read, edit, run, search |
| What you give it | A prompt | A goal |
| Who picks the steps | You do | It does, you approve |

One sentence to carry forward: the model is the same, the shape of the interaction is different, and the shape is what changes what is possible.

## Build It

Install is handled earlier in the course (Phase 00). Start here.

1. Open a terminal.
2. Move into any small project on your machine. A folder with a `README.md` and a couple of source files is plenty.
3. Type the command that starts Claude Code, then press enter. The exact command matches what your platform provides; if you do not remember it, the Phase 00 lesson has it.
4. A prompt appears. It is waiting for you.
5. Type: `tell me what is in this folder`.
6. Watch what it does. It will likely read a file or two before answering. That is the affordance. A chat box cannot do that.
7. Type `exit` or the equivalent close command when you are done. The session ends.

You have now run Claude Code once. Everything from here on the course assumes you have done exactly that.

## Use It

| Situation | Reach for Claude Code | Reach for something else |
|---|---|---|
| You want to explore an unfamiliar codebase | Yes — it can read the files and summarize | A search tool, if you only need one fact |
| You want to write code in a project you can see | Yes — it can edit and run | A chat box, if the project is not on the machine you are using |
| You want a quick definition or fact | Probably not | A chat box, a search engine, the docs |
| You want to run a long, multi-step change across many files | Yes — describe the goal, approve steps as it goes | Doing it by hand, if there are only two or three edits |
| You want a tool to learn a new language or library | Maybe — it can answer inside your project | A tutorial, if you want a structured walk-through |
| You are offline, or your project contains secrets you cannot share | No — Claude Code needs network access and a project context | Local tools, offline docs |

Rule of thumb that holds up: if the answer is already in your head and you just need a faster way to type it, Claude Code is overkill. If the answer requires reading, running, or editing more than one file, Claude Code is built for it.

## Alternatives

Claude Code is one product of a shape, not the only one. The shape — a terminal coding agent that takes a goal, picks a route, and asks before acting — is shared by several tools and several model providers. Two names worth knowing so the rest of the phase reads correctly.

**OpenCode** (`github.com/sst/opencode`) is an open-source terminal coding agent in the same shape. CLI you launch in a project, agent loop, file and shell tools, approval gates, the model is yours to choose. The shape — goal in, route out, you approve — is the same. The brand and the default model are not. If you cannot install Claude Code, or you want to read the source of the tool driving your session, OpenCode is the closest peer.

**DeepSeek** (`api-docs.deepseek.com`) is a model provider, not a tool. Its open-weight chat and reasoning models (e.g. `deepseek-v3`, `deepseek-r1`, `deepseek-coder`) are good at coding and plug into agents of this shape — OpenCode, Cursor's agent mode with custom routing, hand-rolled CLIs. If you want the local-or-cheap angle Lesson 19 opened, DeepSeek's weights give you the same affordance on your own hardware.

| | Claude Code | OpenCode | DeepSeek (as a model) |
|---|---|---|---|
| What it is | Terminal coding agent | Terminal coding agent | Model provider |
| Source | Closed | Open source (`github.com/sst/opencode`) | Weights open; hosted API is paid |
| Default model | Anthropic Claude | Pluggable (BYO key) | DeepSeek-V3 / R1 family |
| Shape | Agent, goal-in | Agent, goal-in | Model — you wire it into an agent |

The rule that makes the rest of this phase portable: when later lessons say "Claude Code," read "the terminal coding agent you happen to have installed." If that agent is OpenCode pointed at DeepSeek, every lesson still applies — the shape is the same, the brand is incidental.

## Exercises

**Exercise 1 — Open it, ask, observe.**

Start Claude Code in any folder. Ask it to list the files in that folder. Pass when you see at least one piece of output that came from the tool actually reading a file, not from you typing the file name. (You will know because you did not type the file name.)

Pass: Claude Code's response mentions a file you did not type.

**Exercise 2 — Describe a small goal, watch the steps.**

Pick a goal that takes three or four steps in your project. Example: "add a function called `slugify` to `utils.py` that lowercases a string and replaces spaces with dashes, then run the tests." Let it work. Pass when you see it propose at least three distinct actions before any of them run, and you can read each one.

Pass: at least three actions appear in the session before any edits happen.

**Exercise 3 — Pick the right tool, and justify it.**

Below are five small tasks. For each, write one sentence saying whether you would use Claude Code, and why. Keep your reasons to the affordances above.

- Find the value of `MAX_RETRIES` in `config.py`.
- Refactor a 200-line module into three smaller ones, with tests.
- Explain what `Promise.allSettled` does.
- Add a new CLI flag to a tool and wire it through the help text.
- Translate a sentence from English to French.

Pass: every answer names a specific affordance (read, edit, run, search) or its absence. No answer is "because it is AI."

## Key Terms

| What people say | What it actually means | Why the misconception matters |
|---|---|---|
| **"Chatbot"** | A program you talk to in turns, one prompt at a time | Claude Code looks like a chatbot in the terminal, but it is shaped for goals, not turns. Calling it a chatbot trains you to use it like a chat box. |
| **"AI assistant"** | The assistant is you; the tool is the thing doing the work | When you call it an assistant, you picture yourself giving instructions. When you call it a tool, you picture yourself choosing when to use it. Different verb shapes the work. |
| **"Agent"** (here) | A program that takes a goal, picks its own steps, and uses tools to make progress | In casual use "agent" means any AI that acts. In this course it means specifically: it decides what to do next, you approve. That distinction is the whole point of Phase 04. |
| **"Completion"** | The model finishes the text you started | Chat interfaces are completion-shaped. You write, it writes. Claude Code is goal-shaped. You describe the destination, it picks the route. |
| **"Terminal tool"** | A program you launch from a shell, that runs with your project's files and permissions | Some "AI tools" are websites that look technical. A terminal tool can actually touch the project you are in. That is the affordance none of the others have. |

## What this lesson skipped

This is the gateway. The point was to install one mental model: terminal tool, goal-shaped, agent not completion. A lot was deliberately left out.

You did not see typed actions like `/help` and `/clear`. Those are part of how you drive a session. Lesson 30 introduces them.

You did not see the repeating cycle the tool runs (read, decide, act, repeat). Lesson 31 names it and shows how to watch it.

You did not see settings, project configuration files, hooks, sub-tools, or any of the machinery that lets the tool reach beyond one session. Each of those arrives later in this phase, in the order you need them.

If the rest of Phase 04 reads differently from a chat-box tutorial, that is on purpose. This is the lesson that makes that reading make sense.

The shape — terminal tool, goal-shaped, agent not completion — is not unique to one product. Open-source alternatives in the same shape exist (one example is `opencode`, from `github.com/sst/opencode`), and the model behind the tool is swappable too — `deepseek` is one provider whose models power tools of this shape (`api-docs.deepseek.com`). The point of this phase is the shape, not the brand. When you read "Claude Code" in later lessons, read "the terminal coding agent you happen to have installed."
