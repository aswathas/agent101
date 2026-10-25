# OAuth, Headers, and MCP Tool Search

> You can authenticate a remote server without pasting a token into a tracked
> file, and you can keep a hundred-tool server from costing you your window.

**Type:** Learn
**Prerequisites:** Lessons 50–53
**Time:** ~35 minutes

---

## Learning Objectives

- Choose between a static header token and OAuth for a remote server, and use `/mcp` to authenticate
- Set headers and OAuth client details in a config without committing a secret
- Explain what tool search defers and what it costs to turn off
- Set `alwaysLoad` deliberately, and say when a tool earns it

---

## The Problem

Two failures, both common, both felt as "the server is broken."

**The first:** a remote server needs a token. You add it with
`--header "Authorization: Bearer sk-..."`, it works, and six weeks later you
find the token in a commit, in a shell history file, and in a screenshot of
`/mcp` somebody posted in a channel.

**The second:** you connect a big server — a whole SaaS surface, fifty tools —
and every session starts slower, `/compact` happens sooner, and you don't know
which of your other tools got squeezed out. Nothing errored. The window just
filled up with descriptions you'd never have read.

The first is a secrets problem and the second is a context problem. Same phase,
different doors.

---

## The Concept

### Two ways to authenticate a remote server

| | Static header | OAuth |
|---|---|---|
| Good for | Your own token, a service account key, a local gateway | Anything where a human logs in |
| Set by | `--header "Authorization: Bearer …"` or the `headers` field | `/mcp`, or `--client-id` / `--callback-port` at add time |
| Revocable | You rotate it | The user re-auths; tokens refresh |
| In a committed `.mcp.json` | **Never.** Use `${API_KEY}` | Yes — the config holds `clientId`, not a secret |

```bash
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer ${API_KEY}"
```

The `${API_KEY}` form keeps the committed file free of the value while still
working for local, user, and project scopes. Expansion happens in `headers`.

OAuth at add time:

```bash
claude mcp add --transport http \
  --client-id your-client-id --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

Or in JSON, with the secret still supplied on the command line rather than in
the file:

```bash
claude mcp add-json my-server \
  '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' \
  --client-secret
```

`clientSecret` is never written into the config. That asymmetry is the design:
`clientId` and `callbackPort` are public facts, the secret is not.

In a session, `/mcp` shows each server's auth state and starts the flow for you.
Companion commands: `claude mcp login <name>`, `claude mcp logout <name>`.

One thing to know about `ws`: it has no OAuth story. A WebSocket server needs
a static token in `headers`. That's a real reason to prefer `http` for anything
remote, beyond the transport advice in Lesson 50.

### Tool search: the context budget

Every tool definition sits in your window — name, description, schema. Add
fifty tools and you have spent a chunk of the budget before the conversation
starts (Lesson 32).

Tool search, **on by default**, changes the order of operations:

- At startup, only **tool names** and the **server's instructions** load.
- Full descriptions and schemas load **on demand**, when Claude decides a tool
  might be relevant and searches for it.

So adding a server with fifty tools costs almost nothing at startup. The budget
goes to tools that were actually used.

```bash
ENABLE_TOOL_SEARCH=auto:5 claude   # threshold mode: load upfront while under 5% of the window
ENABLE_TOOL_SEARCH=false claude    # everything upfront, always
```

`auto:N` is the honest middle: small tool sets load eagerly (no search step for
the tools you always want), large ones defer. Unset is threshold-free — defer
everything. Turn it **off** when a server's tools must be visible for correctness,
not convenience, or when you're debugging discovery and want to see the full
list.

### What description length means now

With tool search on, the description is what Claude searches. Claude Code cuts
descriptions past a limit and the model sees only what came before the cut —
so the words it would search for go **first**. Limits as documented today:
shorter for descriptions that load upfront, longer for ones found through
search. The exact numbers are version-gated and have moved more than once;
read the doc page rather than quoting them.

### `alwaysLoad` — the deliberate exception

```json
{ "mcpServers": { "core-tools": { "type": "http", "url": "…", "alwaysLoad": true } } }
```

The server's tools load into context regardless of the setting. Per-tool,
`"anthropic/alwaysLoad": true` in a `_meta` block does it for one tool.

This is a context purchase, and you pay for it on **every turn of every
session**. Earn it: a "check the deploy status" tool the agent reaches for
often qualifies. A hundred-tool server marked `alwaysLoad` is the mistake this
flag exists to make avoidable.

Note the second effect: `alwaysLoad: true` makes startup **wait** for the
server's tools, because the first prompt needs them present.

### Output size, the other budget

A result larger than the threshold doesn't get truncated — it gets **persisted to
a file** and replaced by a file reference in the conversation. You raise it two
ways:

```bash
export MAX_MCP_OUTPUT_TOKENS=50000   # whole session, set before you start claude
```

or per tool, which is better because it's scoped to the tool that needs it:

```json
{
  "name": "get_schema",
  "description": "Returns the full database schema",
  "_meta": { "anthropic/maxResultSizeChars": 200000 }
}
```

The annotation applies independently of the env var, and there's a hard ceiling
— read the docs for the current number. Images in tool results go inline to the
model *and* get saved to a file in the session's tool-results directory, so
Claude can work on them at full resolution.

> **The reframe:** a remote server's config should never hold a secret — the
> secret belongs in the environment and the auth flow, while the file holds
> only `${API_KEY}`, `clientId`, and a callback port — and a hundred tools cost
> you nothing at startup because of *when* they load, not how many there are.

---

## Build It

### 1. Authenticate against a real remote server

```bash
claude mcp add --transport http context7 -- https://mcp.context7.com/mcp
claude mcp get context7
```

Start Claude Code, run `/mcp`, pick `context7`, and complete the auth flow it
offers. Note that the config entry has **no secret in it**.

```bash
claude mcp get context7
```

Compare to before the flow.

✅ You pass when the entry names a URL and a type, and contains no credential you
would not paste into a public issue.

### 2. Do the same for a server you already trust

`/mcp` also shows logout. Log out, then log back in. Write down where the token
lives — your OS keychain or the config — and confirm it's not in `~/.claude.json`
in plain text.

✅ You pass when you can say where the token is stored and can show that
`~/.claude.json` contains no readable copy of it.

### 3. Put a static token in a project config without committing it

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": { "Authorization": "Bearer ${API_KEY}" }
    }
  }
}
```

Run once **without** `API_KEY` set and once **with** it. Read the error both
times.

✅ You pass when the file on disk contains no secret and the two runs behaved
differently — the difference is proof the expansion happened at load time.

### 4. See what a big tool surface actually costs

With tool search on (default), connect any server with a lot of tools. Then:

```
What tools do you have available right now?
```

The deferred ones are found by search, not listed. Then compare:

```bash
ENABLE_TOOL_SEARCH=false claude
```

Same question. Now you get everything.

✅ You pass when you can state, in terms of your own two runs, what "deferred"
means for what Claude can tell you about its own toolset.

### 5. Find the deferred tool

With tool search **off** and two servers connected, ask for something that lives
on the second one. Then turn tool search **on** and ask again, using words that
appear near the *start* of that tool's description.

✅ You pass when the second phrasing worked and you can say which part of the
description made the difference.

### 6. Buy one tool upfront

Take the tool you reach for most — deploy status, or your test runner. Mark it
`_meta["anthropic/alwaysLoad"]: true` on the server side, or add
`alwaysLoad: true` to the server entry from the client side.

✅ You pass when you can say what you just bought (that tool, always visible)
and what you declined to buy (the rest of the server).

---

## Use It

| Command / field | When you reach for it |
|---|---|
| `${API_KEY}` in `headers` | Any static token, especially in a committed `.mcp.json` |
| `/mcp` | Authenticate, disconnect, inspect a server's tools |
| `claude mcp login <name>` | Re-authenticate outside a session |
| `--client-id` / `--callback-port` | Preconfiguring OAuth at add time |
| `oauth.clientId` in JSON | Public OAuth facts in config; secret stays on the CLI |
| `ENABLE_TOOL_SEARCH=auto:N` | A middle ground when some tools must always be visible |
| `ENABLE_TOOL_SEARCH=false` | Debugging discovery, or when correctness demands the full list |
| `alwaysLoad: true` | One or two tools you reach for every session |
| `anthropic/maxResultSizeChars` | One tool that legitimately returns something huge |
| `MAX_MCP_OUTPUT_TOKENS` | Raising the ceiling session-wide — set before launching `claude` |
| `claude mcp logout <name>` | Revoking access without removing the server |

---

## Exercises

1. Take every MCP server on your machine. For each, write down: how it
   authenticates, where the credential lives, and whether that credential is in
   any tracked file.
   ✅ You pass when the report has one line per server and, for anything remote,
   a location for the token that isn't a repo file.

2. Turn tool search off for a session with three or more servers and run the
   same task twice — once with it off, once on. Count the difference in how many
   turns it took and whether the answer changed.
   ✅ You pass when you have both runs and can say what tool search cost you
   rather than what it saved you.

3. Add a tool that returns 200,000 characters. Measure what Claude Code does
   with it at the default threshold, then again with
   `_meta["anthropic/maxResultSizeChars"]` set.
   ✅ You pass when you can describe what the model saw in each case — inline
   text versus a file reference — and name the threshold you compared against.

4. Decide which one of your servers, if any, earns `alwaysLoad: true`. Write
   the argument, then estimate what it costs you per turn.
   ✅ You pass when the answer names the specific tool, not the server, and your
   estimate is in tokens or tools-per-turn rather than "a bit".

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| OAuth | "the login" | A flow where a human authorises once and tokens refresh. Config holds `clientId`, never the secret |
| `--header` | "the token" | A static credential sent every request. Use `${VAR}` so it isn't in a tracked file |
| `headersHelper` | "dynamic headers" | A shell command a config may run to produce a header. Read it before approving |
| tool search | "lazy loading" | Deferring tool descriptions until a query suggests one. On by default; costs you nothing at startup |
| deferred vs upfront | "loaded" | Deferred = found by searching descriptions. Upfront = always in the window, costs every turn |
| `ENABLE_TOOL_SEARCH` | — | `unset` defers; `auto:N` loads eagerly below N% of the window; `false` loads everything |
| `alwaysLoad` | "pin it" | Exempt a server (or one tool) from deferral. A context purchase, paid every turn |
| `MAX_MCP_OUTPUT_TOKENS` | "the output limit" | Session-wide ceiling. Results past it are written to a file, not truncated |
| `maxResultSizeChars` | "raise the limit" | Per-tool ceiling via `_meta`. Scoped, and independent of the env var |
| `requiresUserInteraction` | "always ask" | Per-tool annotation: a permission prompt on every call, no remember-this option |

---

## What this lesson skipped

**Prompt injection.** Lesson 53 — the trust model this config sits inside.
Reading this lesson without that one is how you end up optimising the wrong
thing.

**Enterprise identity.** SSO, SAML, SCIM provisioning, and managed MCP policy
(`managedMcpServers`, `allowedMcpServers`, `deniedMcpServers`). Real, and behind
a gateway. Read
[Managed MCP configuration](https://code.claude.com/docs/en/managed-mcp) when
your organisation controls the server set.

**Tokens in detail.** Refresh flows, scopes, expiry. You use them; you don't
implement the server side here.

**The exact description-length numbers.** Version-gated, and they've changed
more than once. Look them up in
[Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
rather than trusting a figure quoted here.

**Which transports support which auth.** Only `ws`'s lack of OAuth was
mentioned, because it's the one that changes your transport choice. The full
matrix moves; check the doc.

**Deploying your own authenticated server.** You connect to authenticated
servers in this lesson. Making one — token storage, refresh, scope handling — is
real work and outside this phase.