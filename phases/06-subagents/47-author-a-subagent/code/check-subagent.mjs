#!/usr/bin/env node
// check-subagent.mjs — catch the subagent authoring failures that don't announce
// themselves. Unrecognized frontmatter is ignored by Claude Code with no warning,
// so a typo in a field name is invisible until the field you expected never fires.
//
// Usage: node check-subagent.mjs <path-to-agent.md> [...]
// Exit 0 if every file is clean, 1 otherwise.

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const KNOWN_FIELDS = new Set([
  'name', 'description', 'tools', 'disallowedTools', 'model', 'permissionMode',
  'maxTurns', 'autoCompactWindow', 'skills', 'mcpServers', 'hooks', 'memory',
  'background', 'omitClaudeMd', 'effort', 'isolation', 'color',
  'initialPrompt', 'experimental',
]);

const KNOWN_MODELS = new Set(['sonnet', 'opus', 'haiku', 'fable', 'inherit']);
const KNOWN_EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
const KNOWN_MEMORY = new Set(['user', 'project', 'local']);
const KNOWN_COLORS = new Set([
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan',
]);

function splitFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { raw: null, body: text };
  return { raw: m[1], body: text.slice(m[0].length) };
}

// Flat `key: value` and `- item` lists. Enough for subagent frontmatter, which
// does not nest beyond `mcpServers`/`hooks`/`experimental` — those are passed
// through as opaque blocks.
function parse(raw) {
  const fields = new Map();
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const kv = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    fields.set(kv[1], kv[2]);
  }
  return fields;
}

const asList = (v) =>
  v == null ? [] : v.split(',').map((s) => s.trim()).filter(Boolean);

function check(path) {
  const errors = [];
  const warns = [];
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return { path, errors: [`cannot read ${path}`], warns };
  }

  const { raw, body } = splitFrontmatter(text);
  if (raw == null) {
    return { path, errors: ['no YAML frontmatter block (expected --- on line 1)'], warns };
  }

  const f = parse(raw);

  // --- required fields ---
  const name = f.get('name');
  if (!name) errors.push('missing required field: name');
  else {
    if (name.includes(':')) errors.push(`name contains ':' — not allowed (${name})`);
    if (name.length > 256) errors.push(`name is ${name.length} chars, max 256`);
  }

  const desc = f.get('description');
  if (!desc) {
    errors.push('missing required field: description (this is the routing input)');
  } else {
    if (desc.length < 20) {
      warns.push(`description is ${desc.length} chars — very short to route on`);
    }
    if (desc.length > 400) {
      warns.push(`description is ${desc.length} chars — descriptions cost main-session context`);
    }
  }

  // --- the silent one ---
  for (const key of f.keys()) {
    if (!KNOWN_FIELDS.has(key)) {
      errors.push(`unrecognized field "${key}" — ignored with no warning (typo?)`);
    }
  }

  // --- tool pool ---
  const tools = asList(f.get('tools'));
  const denied = asList(f.get('disallowedTools'));
  const overlap = tools.filter((t) => denied.includes(t));
  if (overlap.length) {
    errors.push(`tools and disallowedTools both list: ${overlap.join(', ')} — disallowedTools wins`);
  }
  if (!tools.length && !denied.length) {
    warns.push('no tools or disallowedTools — the agent inherits the full subagent pool');
  }
  if (denied.some((d) => d.startsWith('Bash(') || /[()]/.test(d))) {
    warns.push('disallowedTools entries with specifiers remove the whole tool, not just matching calls');
  }

  // --- enumerated values ---
  const model = f.get('model');
  if (model && !KNOWN_MODELS.has(model) && !/^[\w.-]+\/[\w.-]+$/.test(model)) {
    errors.push(`model "${model}" is not a known alias — use sonnet/opus/haiku/fable/inherit or a full ID`);
  }
  const effort = f.get('effort');
  if (effort && !KNOWN_EFFORTS.has(effort)) {
    errors.push(`effort "${effort}" is not one of ${[...KNOWN_EFFORTS].join('/')}`);
  }
  const memory = f.get('memory');
  if (memory && !KNOWN_MEMORY.has(memory)) {
    errors.push(`memory "${memory}" is not one of ${[...KNOWN_MEMORY].join('/')}`);
  }
  const color = f.get('color');
  if (color && !KNOWN_COLORS.has(color)) {
    errors.push(`color "${color}" is not a session colour`);
  }

  // --- body ---
  const trimmed = body.trim();
  if (!trimmed) {
    errors.push('empty body — the Markdown body becomes the system prompt');
  } else if (trimmed.length < 60) {
    warns.push(`body is ${trimmed.length} chars — check it describes behaviour, not just a name`);
  }

  return { path, errors, warns };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node check-subagent.mjs <path-to-agent.md> [...]');
  process.exit(2);
}

let bad = 0;
for (const path of files) {
  const { errors, warns } = check(path);
  console.log(`\n${basename(path)}`);
  if (!errors.length && !warns.length) console.log('  clean');
  for (const e of errors) { console.log(`  error: ${e}`); bad++; }
  for (const w of warns) console.log(`  warn:  ${w}`);
}

console.log(
  bad
    ? `\n${bad} error(s). Unrecognized fields fail silently in Claude Code — fix these first.`
    : `\nAll ${files.length} file(s) clean.`
);
process.exit(bad ? 1 : 0);