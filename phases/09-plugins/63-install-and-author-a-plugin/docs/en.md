# Install from a Marketplace, and Author One

> You can build a three-component plugin in one sitting, load it from disk
> before you install it, prove its guardrail actually blocks, and hand it to
> someone else as a marketplace entry.

**Type:** Build
**Prerequisites:** Lesson 62, Plugin Anatomy; and the components themselves —
Lesson 44 (a skill), Lesson 47 (a subagent), Lesson 59 (a hook script)
**Time:** ~45 minutes

---

## Learning Objectives

- Build a plugin directory holding a skill, an agent, and a hook, in the layout
  from Lesson 62
- Validate it from the shell before you ever start a session with it
- Load it with `--plugin-dir`, reload edits with `/reload-plugins`, and read the
  error surface when it doesn't load
- Publish it through a local `marketplace.json` so a teammate installs it by name

---

## The Problem

You have the three files. You move them into a folder, run `claude plugin
install` — except there is nothing to install *from*, because the plugin isn't
in any marketplace, it's just a directory on your laptop. So you pass
`--plugin-dir`, it loads, and the hook doesn't fire. You check the JSON. It's
correct. You check the script by hand — it blocks. In the session, nothing
happens.

Twenty minutes later: the hook *is* loaded, but the matcher is on `Bash` and
the session's tool is named something else, or the script path is
`${CLAUDE_PLUGIN_ROOT}/scripts/...` written in shell form without quotes and
Windows ate it. The session never says. The debug log does.

Or the other one: you paste the hook into `settings.json` "just to test it" and
forget to remove it. Now the plugin's hook and the settings hook both fire, and
the doubled output reads as a broken plugin.

---

## The Concept

There are three ways to get a plugin in front of a session, and they differ only
in who decides when it's ready.

| Route | Loads when | Who runs it |
|---|---|---|
| `--plugin-dir ./x` | That one session | You, every time |
| Plugin in `~/.claude/skills/` | Every session, no flag | Nobody — it just loads |
| Marketplace entry | Sessions where it's installed | A teammate, by name |

**Author loop: `--plugin-dir` → validate → reload.** Build, validate from the
shell, load for one session, edit, `/reload-plugins`. Nothing is installed while
you're developing, so there is no half-installed state to clean up.

**Debug loop: four places, in this order.** When an edit doesn't show up:

1. `claude plugin validate <path>` — manifest and frontmatter
2. `/reload-plugins` — did the session pick up your disk edits
3. `/plugin` → **Errors** tab — what failed to load and why
4. `claude plugin list` (shell) — `Status: loaded` or the load error

The hook case needs one more: trigger the event and read the hook debug log.
A hook that is loaded and never matched looks exactly like a hook that isn't
loaded.

### The rules that cost you the twenty minutes

**Paths are not yours.** A hook calls its script through
`${CLAUDE_PLUGIN_ROOT}`, which expands to the plugin's *installed* directory.
Under `--plugin-dir` that's your folder. Use exec form (`command` + `args`)
so the substituted path stays one argument; if you must use shell form, quote
it.

**Hooks are the only component with a wrapper key.** `hooks/hooks.json` wraps
the event map in `"hooks":`. A bare event map fails to load. Lesson 62 covered
this; it is the single most common first-plugin failure.

**Hooks have no namespace prefix.** A copy in `settings.json` and the plugin's
copy both fire. While converting your existing setup, leave the originals in
place until the plugin version is verified — then delete them, or live with
every block firing twice.

**Skills and agents get renamed.** A skill that was `/review` becomes
`/guardrail-kit:review`. `/deploy` and `/guardrail-kit:deploy` both work while
both exist; they stop being the same agent once you delete the original.

### What a marketplace actually is

A directory or repo with `.claude-plugin/marketplace.json`, listing plugins and
where to fetch each. Not a hosted store — you add it once, then its plugins
install by name. You need one only to share. A teammate with your folder on a
shared drive can just as easily copy the directory.

> **The reframe:** a plugin has four places to fail — the manifest, the layout,
> the path wiring, and the load itself — and exactly one of them will tell you
> so, so the whole authoring loop is really just "find which of the four it
> was" in the order cheapest to check.

---

## Build It

Everything below runs from `code/` in this lesson's folder. A complete plugin is
there as the answer key; do these steps yourself before comparing.

### 1. Create the directory and the manifest

```
cd code
mkdir -p guardrail-kit/.claude-plugin
```

Write `guardrail-kit/.claude-plugin/plugin.json`:

```json
{
  "name": "guardrail-kit",
  "description": "Blocks dangerous git operations and hands diff review to a subagent",
  "version": "1.0.0",
  "author": { "name": "You" }
}
```

✅ You pass when `claude plugin validate ./guardrail-kit` prints
`Validation passed`.

### 2. Add a skill

```
mkdir -p guardrail-kit/skills/review-diff
```

`guardrail-kit/skills/review-diff/SKILL.md`:

```markdown
---
name: review-diff
description: Review the current diff for lost work, secrets, and scope creep before committing.
disable-model-invocation: true
---

Review the working-tree diff for three things: lost work, secrets, scope.
Report file paths. End with `SAFE TO COMMIT` or `BLOCKED: <reason>`.
Do not edit files.
```

Note the directory — `skills/<name>/SKILL.md`. One directory per skill, not a
flat `.md` file.

✅ You pass when `claude plugin validate` still passes and the file is at
`skills/review-diff/SKILL.md`, not `skills/review-diff.md`.

### 3. Add a subagent

`guardrail-kit/agents/diff-scout.md`:

```markdown
---
name: diff-scout
description: Reads one diff and reports what changed. No fixes, no style opinions.
tools: Read, Grep, Glob, Bash
model: sonnet
---

Report file paths and a one-line factual description per file.
Never propose a fix. Never edit a file.
```

The restricted `tools` list is the point: this agent reads and reports. It
cannot edit, so it cannot quietly "help".

✅ You pass when `claude plugin validate` passes and the agent's frontmatter
has no `Edit` or `Write` in `tools`.

### 4. Add the hook

`guardrail-kit/hooks/hooks.json` — note the wrapper:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/block-dangerous-git.mjs\""
          }
        ]
      }
    ]
  }
}
```

And `guardrail-kit/scripts/block-dangerous-git.mjs`:

```javascript
#!/usr/bin/env node
// PreToolUse hook: reads tool-call JSON on stdin, exits 0 to allow,
// 2 to block and show stderr to the model.
import { createInterface } from 'node:readline';

const DENY = [
  { re: /\bgit\s+push\b[^|;&\n]*(--force\b(?!-with-lease)|\s-f\b)/,
    why: 'force push overwrites a branch others may already have based work on. Use --force-with-lease.' },
  { re: /\bgit\s+reset\b[^|;&\n]*--hard\b/,
    why: 'reset --hard discards uncommitted work with no undo. Commit or stash first.' },
];

const rl = createInterface({ input: process.stdin });
let raw = '';
for await (const chunk of rl) raw += chunk;

let toolInput = {};
try { toolInput = JSON.parse(raw || '{}').tool_input ?? {}; }
catch { process.exit(0); }   // unparseable stdin is not our call to make

const normalized = String(toolInput.command ?? '').replace(/\\\r?\n/g, ' ');
const hit = DENY.find(({ re }) => re.test(normalized));
if (hit) {
  process.stderr.write(`guardrail-kit blocked this command: ${hit.why}\n`);
  process.exit(2);
}
process.exit(0);
```

✅ You pass when you can run the script by hand and watch it exit 2:

```
echo '{"tool_input":{"command":"git push --force origin main"}}' \
  | node guardrail-kit/scripts/block-dangerous-git.mjs
echo $?
```

### 5. Load it without installing

```
claude --plugin-dir ./guardrail-kit
```

In the session: type `/` and look for `/guardrail-kit:review-diff`. Run
`/plugin` → **Installed**, find `guardrail-kit`, open its details and confirm
the inventory lists one skill, one agent, one hook.

✅ You pass when `/guardrail-kit:review-diff` runs and `/plugin` lists all three
components.

### 6. Prove the guardrail blocks

In that session, ask the agent to push your branch with force. It should refuse
and quote the hook's stderr. Then try a normal `git status` — that must go
through.

✅ You pass when the force push is refused with your hook's wording and the
harmless command is not.

### 7. Edit and reload

Change the wording in the script's `why` string. Save. In the same session:

```
/reload-plugins
```

Ask again. New wording.

✅ You pass when the new wording appears without restarting the session.

### 8. Publish it as a marketplace

`code/marketplace/.claude-plugin/marketplace.json`:

```json
{
  "name": "workflowtest-local",
  "owner": { "name": "You" },
  "plugins": [
    { "name": "guardrail-kit", "source": "./guardrail-kit" }
  ]
}
```

Note `source` is relative to the *marketplace* directory, so it reads
`../guardrail-kit` from here — fix the path so it resolves, then:

```
/plugin marketplace add ./code/marketplace
/plugin install guardrail-kit@workflowtest-local
```

Choose a scope. Then `/plugin install guardrail-kit@workflowtest-local` again in
a *different* session without `--plugin-dir` and confirm the command is there.

✅ You pass when a session you did not pass `--plugin-dir` to still offers
`/guardrail-kit:review-diff`, and `claude plugin list` shows it with a scope.

### 9. Break it deliberately

Move `skills/` inside `.claude-plugin/`. Validate. Reload. Now the plugin loads
with its skill missing and `/plugin` → **Errors** names the path.

✅ You pass when you have read the exact Errors-tab line, then put `skills/`
back and confirmed the skill returns.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| `claude plugin validate <path>` | Before every load while authoring |
| `claude --plugin-dir <path>` | Testing your plugin for one session |
| `/reload-plugins` | You edited files on disk mid-session |
| `/plugin` → Errors | Something loads but a component is missing |
| `claude plugin list` | Which plugins are loaded, from where, at what scope |
| `/plugin marketplace add <source>` | Sharing your plugin by name |
| `/plugin install <name>@<marketplace>` | Installing, with a scope choice |
| `claude plugin install/disable/enable/uninstall` | The same, from a script, no session |
| `~/.claude/skills/<name>/` with a manifest | A plugin you want in every session, forever |
| `"hooks": { ... }` wrapper | Every plugin hooks file |
| `${CLAUDE_PLUGIN_ROOT}` | Locating bundled scripts — never for state |

---

## Exercises

1. Add a second skill to the plugin. Name it `ship`. Reload. Confirm both
   `/guardrail-kit:review-diff` and `/guardrail-kit:ship` exist and that neither
   appears without the prefix.
   ✅ You pass when you can run both, and can say what the unprefixed version
   would have been called as a loose skill.

2. Copy the whole plugin to a scratch folder, delete `.claude-plugin/plugin.json`,
   and load it with `--plugin-dir`. It should still work, named after the
   directory.
   ✅ You pass when the skill and agent still run and you can state where the
   name now comes from — and which name prefix the components now carry.

3. Add a third rule to `DENY` for `git rebase` on a shared branch. Then test all
   four of these by piping to the script and reporting each exit code:
   `git push --force-with-lease`, `git push --force`, `git reset --soft HEAD~1`,
   `git reset --hard HEAD~1`.
   ✅ You pass when `--force-with-lease` and `--soft` exit 0, and you can point
   at the exact regex difference that separates the allowed form from the
   blocked one.

4. Install your plugin at **user** scope, then at **project** scope, and open
   `.claude/settings.json` and `.claude/settings.local.json` to see where each
   landed. Then commit a change and note what that does for a collaborator.
   ✅ You pass when you can say which file each scope writes and what a
   collaborator still has to run themselves.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| `--plugin-dir` | "install it" | Loads a directory for **one session**. Nothing is written to settings. The authoring loop. |
| marketplace | "the store" | A repo or directory with `.claude-plugin/marketplace.json`. You add it once; its plugins install by name. |
| `name` in `plugin.json` | "the label" | The required prefix on every skill and agent the plugin provides. |
| scope | "where it's installed" | `user` (all your projects), `project` (committed `.claude/settings.json`, everyone), `local` (this repo, you). |
| validate | "test it" | Checks the manifest and every component's frontmatter, from the shell, before load. |
| `/reload-plugins` | "refresh" | Picks up disk edits in a running session. May decline if it would invalidate the prompt cache. |
| Errors tab | "the error log" | `/plugin` → **Errors**: what failed to load and why. Silent failures are listed here, nowhere else. |
| `${CLAUDE_PLUGIN_ROOT}` | "the install path" | The plugin's installed directory. Moves on update — never write state there. |

---

## What this lesson skipped

**Publishing to Anthropic's directory.** Submitting for public listing, review,
and the listing fields (`icon`, `homepage`, the four URL fields). Real process,
separate page in the docs. Come back when you actually want strangers to find it.

**Plugin dependencies.** `"dependencies": ["other-plugin"]` makes Claude Code
install and enable the other plugin too, and refuse to disable one that
something still needs. Come back when you split a plugin in two.

**`userConfig`.** Prompting the user for values — an endpoint, a masked token —
at install time. This is the mechanism that lets a plugin ship an MCP server
needing credentials. Worth a whole pass; not needed by a plugin that runs a
local script.

**Bundled MCP servers.** `.mcpb` / `.dxt` bundles inside a plugin. Phase 07 owns
the server; this phase only needed to show it rides along.

**Auto-update.** Marketplace plugins from the official marketplace refresh on
their own; yours and third-party ones do not, by default. One line in
`/plugin` → Marketplaces when you want it, and a Phase 03 cost conversation.