# Module: 07.1 — Build an MCP server. Then ask: would you trust a repo you cloned?

**Type:** Decide
**Phase:** 07
**Time:** ~90 minutes
**Prerequisites:** Lessons 49–54

---

## The task

Build one MCP server of your own — something you would actually use — and ship it
in a way that survives being committed to a repo. Then answer the question the
whole phase has been pointing at: **would you connect this, from a repo you
cloned, on a machine that holds your credentials?**

The artifact is two files: the server, and a one-page trust decision you can
defend. The server is the easy half. Module 06.1 asked you to make a subagent
refuse everything it shouldn't; this one asks you to hand a stranger's code a
seat in the loop and then argue about whether that was wise.

> **Constraint:** the server must be committed to version control as a
> `.mcp.json` project-scope entry, with **no secret anywhere in it** — not in
> the config, not in the source, not in a comment. Every machine supplies its own
> values. If you need a credential, you get it from the environment.

---

## Why this isn't just a tutorial

Building a server is a few dozen lines; the SDK tutorials do it in one. What
they don't do is make you answer for the file you just committed.

The naive version is: write a tool, add it with `claude mcp add`, done. That
produces something that works on your machine and cannot be shared — which is
exactly the shape of the failure in Lesson 51, reproduced on purpose. The
constraint above forces you past it: if the entry is committable, it can't hold
a token, which means you have to decide where the credential actually comes
from and say so.

And the second half is a `Decide`, not a Build. A working server proves nothing
about whether it should be connected. The question is what it could reach, who
authors the text it returns, and what you'd change to make the answer easier.

---

## The constraint, stated properly

- **What breaks:** you write `API_KEY=sk-abc123` into the config. It works. It
  is now in git history, in your shell history, and in every clone of that repo
  from now on — and rotating it means a commit, a branch, and a PR.
- **How you'll know:** `git log -p | grep -i "key\|token\|secret\|bearer"` returns
  something. Or: your `.mcp.json` contains a literal where a `${VAR}` should be.
- **What costs you:** the credential, permanently, in a history that rewriting
  doesn't reliably reach.

## Method

1. **Pick a real job.** Something you'd reach for this week: a script you run by
   hand, a query you paste, a status check you look up. Small beats impressive.
   If it needs an API key, that makes the constraint bite — take it anyway.
2. **Write the server.** stdio, no SDK needed. Lesson 52's server is your
   reference; a self-check that asserts on real JSON-RPC replies is worth more
   than a clever tool. Two tools is enough.
3. **Give it a hostile input path.** One of your tools returns text you don't
   fully control — a file, a web page, a field someone typed. Put a note in it
   that tries to instruct the agent to do something you would not want. Lesson
   52's `notes.json` shows the shape.
4. **Wire it up at project scope, and commit it.** `.mcp.json` at the repo root.
   Values via `${VAR}`. Commit.
5. **Clone it somewhere else.** A fresh directory, outside this repo. Run it
   there. This is the actual test and the part most people skip.
6. **Run your hostile input** in the clone and record what the agent did.
7. **Write the decision.** One page. The questions are below.

## The decision, in writing

Answer each. Short is fine; vague is not.

1. What can this server's code reach on the machine that runs it?
2. Who authors the text its tools return — you, your team, or the public?
3. What credentials does it hold, and what is the narrowest form those could
   take? Write the actual scope, not "a token".
4. What happened when you ran the hostile input in the clone — did the agent
   comply, refuse, flag it?
5. Your decision: **connect as-is**, **connect with changes**, or **don't
   connect**. Plus the one thing that would change your mind.
6. Does the answer change if the repo is a stranger's rather than yours? Say
   what specifically you'd check first.

## What to submit

```
attempts/
├── NOTES.md            what you built, what surprised you, what you'd change
├── server.mjs          the server
├── test-server.mjs     a self-check that asserts on real JSON-RPC replies
├── .mcp.json           the project-scope entry, committable, no secrets
├── trust-decision.md   the six answers above
└── evidence/
    ├── injection-run.md  what the agent did with the hostile input, verbatim
    └── clone-test.md     what happened in the fresh clone
```

`NOTES.md` is required. Code alone is not a submission — the reasoning is the
part worth reading.

---

## Rules

- Work in this repo. Commit as you go.
- If the server has to talk to a real API, keep it read-only and use a
  credential you're willing to see in a clone.
- If something doesn't work as this brief describes, **the brief may be wrong**.
  Write down what actually happened — that's a finding, not a failure.
- You may not run the hostile input against anyone else's server or system.

---

## Done means

- [ ] The server runs from a clean state, and `test-server.mjs` asserts on real
      replies rather than on nothing
- [ ] `.mcp.json` is committed and contains no secret — `git log -p` proves it
- [ ] It works from a fresh clone in a fresh directory
- [ ] The hostile input was actually run, and what happened is written down
- [ ] All six decision questions are answered, with #3 naming a concrete scope
- [ ] `NOTES.md` states the trade-off you made and why
- [ ] You can explain, without the code open, why a committable server can't
      hold a credential

The last one is the real test.