# Plugin Anatomy — the directory and the manifest

> You can open any installed plugin on disk, say what each file does the moment
> it loads, and tell whether a manifest is going to load or be stripped.

**Type:** Learn
**Prerequisites:** Lesson 61, Plugins Are the Packaging Layer
**Time:** ~35 minutes

---

## Learning Objectives

- Open an installed plugin on disk and name every file in it by purpose
- Say which files are found automatically and which need a manifest key
- Write a manifest that validates, including the path rules that silently fail
- Read `claude plugin details` and say which component is paying for what

---

## The Problem

A plugin fails to load and tells you nothing useful. Your skill isn't there. No
error in the session. You spend twenty minutes checking whether the skill's
frontmatter is valid, whether the name has a space in it, whether the session
just needs a reload — and the actual cause was that you put `skills/` inside
`.claude-plugin/` instead of beside it, where nothing scans.

The mirror-image failure is worse. It loads, it works, and it does the wrong
thing: your plugin ships a `commands/` folder *and* a `commands` key in its
manifest, the key wins, and every command file in the default folder is now
invisible. `claude plugin list` shows the plugin as loaded. `/plugin` shows no
errors. Your commands are just gone.

Both are layout mistakes. Neither is visible from inside Claude Code.

---

## The Concept

Two files do all the work: the **standard layout**, which is what Claude Code
scans when you don't tell it otherwise, and the **manifest**
(`.claude-plugin/plugin.json`), which is optional metadata plus overrides.

### The standard layout

Everything except the manifest lives at the **plugin root** — the directory you
pass to `--plugin-dir` or that the installer created.

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json          ← the only file that belongs in here
├── skills/
│   └── review/
│       └── SKILL.md         ← one directory per skill
├── agents/
│   └── reviewer.md          ← one file per subagent
├── hooks/
│   └── hooks.json           ← wrapped in a top-level "hooks" key
├── .mcp.json                ← MCP servers
├── bin/                     ← executables added to PATH while enabled
└── scripts/                 ← your scripts, called by your hooks
```

The rule that causes both failures above: **only `plugin.json` goes inside
`.claude-plugin/`.** Components saved there do not load. Everything else sits
beside that folder, at the plugin root.

Commands are the older form of skills — flat `.md` files in `commands/`. Use
`skills/` for anything new.

### The manifest

Optional. With no manifest, Claude Code loads whatever it finds in the standard
layout, and names the plugin after the directory (or after the marketplace
entry). Write one when you want metadata, a component in an unusual place, or
values to prompt the user for.

The only required field is `name`, and `name` does real work — it's the prefix
on every skill and agent the plugin provides. Kebab-case, no spaces. `review`
in plugin `guardrail-kit` is `/guardrail-kit:review`.

```json
{
  "name": "guardrail-kit",
  "description": "Blocks dangerous git operations and reviews diffs",
  "version": "1.0.0",
  "author": { "name": "You" }
}
```

A handful of component keys, and each one has a *different* relationship to the
default location. This is the part that produces the silent failure:

| Key | Relationship to the default folder |
|---|---|
| `skills` | **Adds.** `skills/` still scanned; your paths load alongside. |
| `hooks` | **Merges.** `hooks/hooks.json` loads, then yours merges in. |
| `mcpServers` | **Merges.** `.mcp.json` loads first; a same-named server later replaces an earlier one. |
| `commands` | **Replaces.** The default `commands/` is not scanned. |
| `agents` | **Replaces.** Same. |
| `outputStyles`, `workflows` | **Replaces.** Same. |

So `"commands": "./custom/commands.md"` silently turns off your `commands/`
folder. To keep both, list both: `"commands": ["./commands/", "./custom/"]`.

### Path rules, and how they fail

Every component path is relative to the plugin root and must start with `./`.
`"hooks": "hooks/extra.json"` fails validation; `"hooks": "./hooks/extra.json"`
is fine. (`skills` also accepts `"."`, and `mcpServers` also accepts an `https://`
bundle URL.)

Two failures happen at load and neither is loud:

- **Path doesn't exist** → that component doesn't load; `/plugin` **Errors** tab
  says `commands path not found: ./commands/`.
- **Path escapes the root** (`../` anywhere) → doesn't load; Errors tab says
  `path escapes plugin directory`.

### Hooks and the wrapper key

`hooks/hooks.json` is the one file with a shape you can't guess from its name.
The event map — the thing you wrote in Phase 08 and put in `settings.json` —
goes *inside* a `"hooks"` key:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/format.sh" }
        ]
      }
    ]
  }
}
```

A file containing only the bare event map, without the wrapper, fails to load.
The manifest's own inline `hooks` value is the event map itself — no wrapper
there. Easy to get backwards; validate before you debug anything else.

### Paths inside a plugin are not your paths

`${CLAUDE_PLUGIN_ROOT}` expands to the plugin's installed directory, and
`${CLAUDE_PLUGIN_ROOT}` **changes every time the plugin updates.** Never write
state there. For state that survives an update, use `${CLAUDE_PLUGIN_DATA}`.

Use exec form (`command` + `args`) for hooks wherever you can, so a substituted
path stays one argument. If you use shell form, quote the variable.

> **The reframe:** almost every confusing plugin failure is a *path* problem,
> and Claude Code reports path problems in exactly one place — the `/plugin`
> **Errors** tab — so learn to read that tab before you start editing anything.

### What it costs

`claude plugin details <name>` from your shell prints the component inventory
and, for each skill or agent, an **always-on** share and an **on-invoke** share.
Always-on is paid every session the plugin is enabled. Hooks get no estimate —
they cost no model context. MCP tool schemas aren't counted there either; read
those in `/context` under `MCP tools`. Lesson 64 is entirely about this number.

---

## Build It

### 1. Find one on disk

```
claude plugin list
ls ~/.claude/plugins/
```

✅ You pass when you can name the directory of one installed plugin and see a
`.claude-plugin/` inside it.

### 2. Read a real manifest

Pick one with a version, then:

```
cat ~/.claude/plugins/repos/<marketplace>/<plugin>/.claude-plugin/plugin.json
```

✅ You pass when you can name its `name` field and say what prefix that name
puts on the plugin's skills.

### 3. Walk the layout and match each file to its lesson

```
find ~/.claude/plugins/repos/<marketplace>/<plugin> -maxdepth 2 -type f
```

For each file, say which earlier phase taught you what it is: `skills/` →
Phase 05, `agents/` → Phase 06, `hooks/hooks.json` → Phase 08, `.mcp.json` →
Phase 07.

✅ You pass when every file above the plugin root maps to a phase you have
actually read, and you can say which one is the odd one out.

### 4. Validate an installed plugin

```
claude plugin validate ~/.claude/plugins/repos/<marketplace>/<plugin>
```

✅ You pass when you get `Validation passed` (with or without warnings) and can
name what each warning says, or state there were none.

### 5. Read the price

```
claude plugin details <plugin-name>
```

Note the `Always-on` line, then find the largest per-component always-on row.

✅ You pass when you can name the number and the single component responsible
for most of it.

### 6. Break it on purpose, in a copy

Copy the plugin directory to a scratch folder. Move `skills/` *inside*
`.claude-plugin/`. Validate. Then:

```
claude --plugin-dir /path/to/scratch-copy
```

Type `/` in the session. The skills are gone and `/plugin` **Errors** says the
path was not found.

✅ You pass when the plugin loads with its skills missing and you can read the
Errors-tab line naming the cause — then restore the copy.

---

## Use It

| Command / concept | When you reach for it |
|---|---|
| `claude plugin list` | What is loaded, and from where on disk |
| `claude plugin validate <path>` | Before you load anything you've edited |
| `claude plugin details <name>` | What a plugin costs, and which component pays it |
| `claude --plugin-dir <path>` | Testing your own plugin for one session |
| `/reload-plugins` | You edited files and the session hasn't picked them up |
| `${CLAUDE_PLUGIN_ROOT}` | Hooks and MCP servers locating bundled scripts |
| `${CLAUDE_PLUGIN_DATA}` | Anything that must survive a plugin update |
| Manifest key `skills` | *Adds* to the default folder — safe to use |
| Manifest key `commands` / `agents` | *Replaces* — check you meant to |
| The `"hooks"` wrapper in `hooks/hooks.json` | Every time, without exception |

---

## Exercises

1. Take any installed plugin. Write down its component inventory and its
   always-on token cost. Then answer: if you did not use this plugin at all this
   month, what would you have saved?
   ✅ You pass when you have both numbers on paper and can name whether the
   saving was in context, in processes, or in both.

2. Write a manifest for a hypothetical plugin `guardrail-kit` with two skills
   that live in `skills/` and one hook file in `config/`. Then predict: does
   setting a `commands` key break the `commands/` folder? Does setting a
   `skills` key?
   ✅ You pass when you can show both predictions and justify each from the
   replace-vs-add table rather than from intuition.

3. Find the hook wrapper. Open an installed `hooks/hooks.json`, and open the
   equivalent block in that plugin's own `settings.json` if it ships one. Write
   down the exact difference in shape.
   ✅ You pass when you can reproduce the wrapper key from memory and say what
   the loader does if you leave it out.

---

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| plugin root | "the plugin folder" | The directory holding `.claude-plugin/` **and** the component folders. Only `plugin.json` lives in the first one. |
| manifest | "the config" | `.claude-plugin/plugin.json`. Optional. `name` is the only required field, and it becomes the prefix on every skill and agent. |
| standard layout | "the default folders" | The directories Claude Code scans when the manifest doesn't point elsewhere. |
| replaces vs adds | "it's a list" | `commands`/`agents`/`outputStyles`/`workflows` replace their default folder. `skills` adds to it. `hooks`/`mcpServers` merge with it. |
| `${CLAUDE_PLUGIN_ROOT}` | "the plugin path" | The installed plugin directory — and it moves on every update. Never write state there. |
| `${CLAUDE_PLUGIN_DATA}` | "the data dir" | Created on first reference, survives updates. This is where `node_modules` and caches go. |
| always-on tokens | "the startup cost" | What the plugin's skill and agent names and descriptions add to *every* session it's enabled in. Paid whether or not anything runs. |
| validate | "lint the plugin" | `claude plugin validate` checks the manifest and every component's frontmatter before you load anything. |

---

## What this lesson skipped

**Every manifest field.** There are around thirty. You need four. The rest —
`userConfig`, `dependencies`, `lspServers`, `channels`, `outputStyles`,
`workflows`, `experimental` — matter when you're publishing to strangers. Come
back to the [manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference)
when a field you need isn't in the four-field example.

**User configuration prompts.** `userConfig` lets a plugin ask the user for
values (an API endpoint, a masked token) at install time. Real, and the reason
a plugin can ship an MCP server that needs credentials. Lesson 63 touches it in
passing; come back when you are shipping a server, not a guardrail.

**MCP servers in depth.** That the plugin ships one is all this lesson needs;
Phase 07 owns how it works.

**Prompt-cache invalidation.** Enabling or disabling a plugin mid-session can
invalidate the cache, which is why `/reload-plugins` sometimes refuses and tells
you to pass `--force`. That's a Phase 03 cost concern. Worth knowing the word
now so the message doesn't puzzle you later.