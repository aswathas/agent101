# Scopes, Precedence, Config Shape

> You can say which file your server lives in, which one wins when two define
> it, and why a token you meant to keep private is now in a commit.

**Type:** Learn
**Prerequisites:** Lesson 50, Four Transports
**Time:** ~30 minutes

---

## Learning Objectives

- Place a server in `local`, `project`, or `user` scope deliberately, knowing which file that writes
- Predict which definition wins when the same server name exists in two scopes
- Write a `.mcp.json` that a team can commit without committing a secret
- Use `${VAR}` expansion so the committed file holds no credentials

---

## The Problem

You add a server for your team and commit `.mcp.json` so everyone gets it. Six
weeks later the file is history, the token is in it, and rotating the token
means a commit, a branch, and a PR to a repo that has forty people in it.

Nobody did anything clever. `claude mcp add` defaulted to a scope, the default
writes to a file most people never look at, and the day somebody reached for
`--scope project` because they *wanted* to share it, the scope did exactly what
it says.

Scopes aren't a preference. They're the answer to two separate questions: *who
else needs this server* and *whose machine is this config allowed to run code
on*.

---

## The Concept

Three scopes. Learn the **file** for each and the rest follows.

| Scope | Loads in | Shared? | File |
|---|---|---|---|
| `local` | This project only | No — just you | `~/.claude.json`, under this project's entry |
| `project` | This project only | **Yes** — it goes in version control | `.mcp.json` at the project root |
| `user` | Every project for you | No | `~/.claude.json`, top level |

`local` is the default. That default is the safe one, and it's the reason the
foot-gun above needs `--scope project` spelled out.

Notice `local` and `user` both live in `~/.claude.json` — `local` nested under a
per-project key, `user` at the top level. They differ in what they load into,
not in where the bytes are. And yes: MCP `local` scope is *not*
`.claude/settings.local.json`, which is where MCP-adjacent settings live. People
spend real time on that one.

```bash
claude mcp add --transport stdio notes -- node server.mjs              # local, the default
claude mcp add --transport stdio notes --scope project -- node server.mjs
claude mcp add --transport http    hubspot --scope user https://mcp.hubspot.com/anthropic
```

### Precedence

When the same **name** is defined more than once, highest wins:

1. `local`
2. `project`
3. `user`
4. plugin-provided servers
5. claude.ai connectors

An organization's `managedMcpServers` rank above all of these.

Two things people get wrong:

- **No merging.** Claude Code takes the entire highest-precedence entry. It does
  not combine a `project` entry's `url` with a `local` entry's `headers`. You
  get one winner, whole.
- **Duplicates are matched by name.** Rename a server and you have two servers,
  not an override.

The first rule is the one that catches people: local beats project, so the
safest thing you can do while debugging a shared `.mcp.json` is to define the
same name locally and iterate there. Your local copy wins; nobody else is
affected; delete it when you're done.

### The `.mcp.json` shape

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      },
      "timeout": 600000
    }
  }
}
```

Field by field:

| Field | Required | Notes |
|---|---|---|
| `type` | Yes for remote | `http`, `sse`, `ws`. Absent on a remote entry → invalid, skipped silently. |
| `url` | Remote only | `${VAR}` and `${VAR:-default}` both work |
| `command`, `args` | stdio only | Also expanded |
| `env` | stdio only | Also expanded |
| `headers` | http / ws | Also expanded |
| `timeout` | No | Milliseconds, per server. Hard wall clock. Below 1000 is ignored. |
| `alwaysLoad` | No | `true` keeps this server's tools in context at startup — Lesson 54 |

Expansion works in `command`, `args`, `env`, `url`, and `headers`. That list is
the answer to the opening problem: commit the file with `${API_KEY}` and let the
machine supply the value. **Never commit a real token to `.mcp.json`.**

### Project scope needs approval

A committed `.mcp.json` may contain a command that runs code. In an interactive
session Claude Code asks before using it. A **cloned** repo can't approve its own
servers — settings committed to the repo are ignored until you accept the
workspace trust dialog. Until then the server sits at *pending approval*.

```bash
claude mcp reset-project-choices
```

That forgets the decisions. It's the "I approved that months ago and no longer
remember what it was" button, and you should press it whenever you're unsure.

### Related environment variables

| Variable | What it bounds |
|---|---|
| `MCP_TIMEOUT` | Server startup. For remote servers it also participates in the request timeout. |
| `MCP_TOOL_TIMEOUT` | Per-tool wall clock. A server's `timeout` field overrides it. |
| `CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT` | Idle shutdown. `0` disables. Defaults differ between remote and stdio. |
| `MCP_CONNECTION_NONBLOCKING` | `0` makes startup wait for servers to connect |
| `ENABLE_TOOL_SEARCH` | Lesson 54 |

If both timeouts are unset, the default tool wall clock is very long. A tool
that hangs will hang for a long time, and that's configuration, not a bug.

> **The reframe:** scope isn't where you keep settings — it's who gets to run
> this code, and `local` beating `project` is the safety valve that lets you
> debug a shared config without ever editing the shared file.

---

## Build It

Do this inside this repo, which is a real project with version control.

### 1. Prove the default scope and find the file

```bash
claude mcp add --transport stdio scratch -- node -e "process.stdin.resume()"
grep -n "scratch" ~/.claude.json | head
```

No `--scope`, so `local`: nested under this project's key in `~/.claude.json`,
invisible to your teammates and not in `git status`.

✅ You pass when you can point at the `~/.claude.json` entry and confirm
`git status` shows nothing new.

### 2. Write a project-scoped entry by hand

Create `.mcp.json` in this repo root:

```json
{
  "mcpServers": {
    "project-echo": {
      "type": "stdio",
      "command": "node",
      "args": ["-e", "process.stdin.resume()"]
    }
  }
}
```

Start Claude Code in this folder. Expect a trust prompt, then a server-approval
prompt.

✅ You pass when `/mcp` shows `project-echo` connected, and `git status` now
lists `.mcp.json`.

### 3. Watch precedence win

Now add the *same name* locally:

```bash
claude mcp add --transport stdio project-echo --scope local -- node -e "console.error('LOCAL WON'); process.stdin.resume()"
```

Restart, approve if asked, and trigger the tool. If `/mcp` shows one
`project-echo`, the local one is live. Confirm which by looking for `LOCAL WON`
in the server's stderr output.

✅ You pass when you can see `LOCAL WON` and can say which of the two files the
winner came from — without logging out to test.

### 4. Prove there's no merging

Edit `.mcp.json` so `project-echo` has a distinctive `env` value. Restart. The
local entry still wins entirely, including the fields you added project-side.

✅ You pass when your project-side edit changes nothing, which is what "no
merging" looks like in practice.

### 5. Clean up

```bash
claude mcp remove project-echo
claude mcp remove scratch
rm .mcp.json
```

`git status` should be clean. If it isn't, something was committed that you
meant to keep local — find it now, not in six weeks.

✅ You pass when `git status` is clean and `claude mcp list` shows neither
server.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| (no `--scope`) | Default. Anything you're not sure about |
| `--scope local` | Debugging a shared `.mcp.json` — it wins, and it's yours alone |
| `--scope project` | The team genuinely needs it, and it holds no secrets |
| `--scope user` | You want it in every project you open |
| `.mcp.json` | The only MCP file that belongs in version control |
| `~/.claude.json` | Personal servers, both `local` and `user` |
| `${API_KEY}` / `${VAR:-default}` | Any value that differs per machine — never a literal secret |
| `claude mcp reset-project-choices` | You can't remember what you approved |
| Per-server `timeout` | One server is slow and the others are fine |
| `managedMcpServers` | You are behind an organization and something you can't change is winning |

---

## Exercises

1. Take a server you actually use. Place it deliberately: decide local vs
   project vs user, write down the one-sentence reason, then run the command.
   ✅ You pass when the entry is in the file you predicted, and `git status`
   shows a change only if you chose `project` on purpose.

2. Write a `.mcp.json` with a `${VAR}` and a `${VAR:-default}`, commit nothing,
   and prove expansion works by running with and without the variable set.
   ✅ You pass when you have both runs' output and the fallback visibly kicks in
   only when the variable is absent.

3. Reproduce a precedence surprise on purpose: define one server name in two
   scopes with different commands, and write down which one ran and why the
   other didn't.
   ✅ You pass when your write-up names the winner by scope, mentions that the
   entries are matched by name, and notes that nothing was merged.

4. Grep a repo you work in for `.mcp.json`. For every entry, decide: would I
   be comfortable with this running on a colleague's laptop? Report what you'd
   change.
   ✅ You pass when the report has one line per entry and at least one entry
   you would change — an empty report on a real repo usually means you
   skimmed.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| scope | "where the config lives" | Who the server is for, which decides both the file and who else gets the code |
| `local` | "my project's settings" | `~/.claude.json` under this project. Default. Beats `project`. |
| `project` | "shared config" | `.mcp.json`, committed, and gated behind approval on first use |
| `user` | "global" | `~/.claude.json` top level. Loads in every project, never shared |
| precedence | "which one wins" | local > project > user > plugin > connectors; managed config above all |
| no merging | — | The whole highest-precedence entry is used. Fields are never combined across scopes. |
| matched by name | — | Two entries are rivals only if their `mcpServers` keys are identical |
| `${VAR:-default}` | "env interpolation" | Expanded in `command`, `args`, `env`, `url`, `headers` — how a committed file holds no secrets |
| workspace trust | "the trust dialog" | A cloned repo cannot approve its own project servers until you accept it |
| `reset-project-choices` | "un-approve" | Forgets prior approvals so you read the prompt again |

---

## What this lesson skipped

**Organization policy.** `managedMcpServers`, `allowedMcpServers`,
`deniedMcpServers` in a managed config. That's the enterprise version of this
lesson — same precedence idea, one level above your user. Read
[Managed MCP configuration](https://code.claude.com/docs/en/managed-mcp) when
you're behind a company gateway.

**`alwaysLoad` and tool search.** The field appears in the config table here
because you'll meet it in a config file. What it does to your context window is
Lesson 54.

**Secrets beyond expansion.** Env expansion gets the token out of the file. It
does not stop a token from landing in a shell history, a crash report, or a
screenshot of `/mcp` — that's a Phase 17 concern about running this for real.

**Per-server idle timeouts in depth.** Named in the table, not explored.

Current file locations and precedence are documented at
[Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp).
The scope table has changed across releases — check it rather than trusting
this page.