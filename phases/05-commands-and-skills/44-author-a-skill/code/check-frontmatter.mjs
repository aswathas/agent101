#!/usr/bin/env node
// check-frontmatter.mjs — catch the failures that make a skill silently not load.
//
//   node code/check-frontmatter.mjs .claude/skills
//   node code/check-frontmatter.mjs .claude/skills/review/SKILL.md
//   node code/check-frontmatter.mjs .claude/commands        # legacy shape
//
// Exit 0 = no errors (warnings allowed). Exit 1 = at least one error.
//
// ponytail: this is a line scanner, not a YAML parser. It reads top-level
// `key:` lines and the first line after them. It will miss a `key:` nested
// inside a block scalar in the body of a field — if you need real YAML
// validation, run `claude plugin validate <dir>` (Claude Code v2.1.233+).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const FIELDS = new Set([
  'name', 'description', 'when_to_use', 'argument-hint', 'arguments',
  'disable-model-invocation', 'user-invocable', 'allowed-tools',
  'disallowed-tools', 'model', 'effort', 'context', 'agent', 'background',
  'hooks', 'paths', 'shell', 'metadata', 'license', 'compatibility',
]);

// Legacy command files accept everything except these two.
const SKILL_ONLY = new Set(['name', 'paths']);

const BOOLEAN_FIELDS = new Set(['disable-model-invocation', 'user-invocable']);
const BOOLEANS = new Set(['true', 'false', 'yes', 'no', 'on', 'off', '1', '0']);

// Characters Claude Code refuses in a command name or frontmatter `name`.
const REFUSED = [
  [/[-‏‪-‮⁠-⁤﻿]/u, 'zero-width or direction-changing character'],
  [/[<>]/, '< or >'],
  [/ {2,}/, 'more than one space in a row'],
  [/^ | $/, 'leading or trailing space'],
];

function collect(target) {
  const st = statSync(target);
  if (st.isFile()) return [target];
  const out = [];
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    const full = join(target, entry.name);
    if (entry.isDirectory()) out.push(...collect(full));
    else if (entry.name === 'SKILL.md' || entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function check(file) {
  const errors = [];
  const warnings = [];
  const legacy = basename(file) !== 'SKILL.md';
  const rel = file;

  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  if (lines[0] !== '---') {
    errors.push('line 1: opening `---` must be the very first line');
    return { rel, errors, warnings };
  }

  const close = lines.indexOf('---', 1);
  if (close === -1) {
    errors.push('no closing `---` — the whole file is being read as frontmatter');
    return { rel, errors, warnings };
  }

  const head = lines.slice(1, close);
  const body = lines.slice(close + 1).join('\n').trim();
  if (!body) warnings.push('body is empty — the skill has nothing to do');

  const fields = new Map();
  head.forEach((line, i) => {
    const m = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (m) fields.set(m[1], { value: m[2].trim(), line: i + 2 });
  });

  for (const [key, { line }] of fields) {
    if (!FIELDS.has(key)) errors.push(`line ${line}: unknown field \`${key}\``);
    if (legacy && SKILL_ONLY.has(key)) {
      errors.push(`line ${line}: \`${key}\` is ignored in a legacy command file`);
    }
  }

  if (!fields.has('description')) {
    errors.push('no `description` — the model has nothing to match a request against');
  }

  for (const field of BOOLEAN_FIELDS) {
    const entry = fields.get(field);
    if (entry && entry.value && !BOOLEANS.has(entry.value.toLowerCase())) {
      errors.push(`line ${entry.line}: \`${field}\` must be a boolean, got \`${entry.value}\``);
    }
  }

  const name = fields.get('name');
  if (name) {
    for (const [re, why] of REFUSED) {
      if (re.test(name.value)) {
        errors.push(`line ${name.line}: \`name\` holds a ${why} — Claude Code refuses the name`);
      }
    }
  }

  const desc = fields.get('description');
  if (desc && desc.value) {
    const combined = desc.value.length + (fields.get('when_to_use')?.value.length ?? 0);
    if (combined > 1536) {
      warnings.push(`line ${desc.line}: description + when_to_use is ${combined} chars, over the 1,536 cap`);
    }
    if (!/\b(use|when|ask|says)\b/i.test(desc.value)) {
      warnings.push(`line ${desc.line}: description says what it is, not when to use it — add trigger words`);
    }
  }

  if (!legacy && !name) {
    warnings.push('no `name` — the command comes from the directory name');
  }

  return { rel, errors, warnings };
}

const target = process.argv[2];
if (!target) {
  console.error('usage: node check-frontmatter.mjs <skills-dir | SKILL.md>');
  process.exit(2);
}

const files = collect(target);
if (!files.length) {
  console.error(`no SKILL.md files under ${target}`);
  process.exit(2);
}

let failed = 0;
for (const file of files) {
  const { rel, errors, warnings } = check(file);
  if (!errors.length && !warnings.length) {
    console.log(`ok    ${rel}`);
    continue;
  }
  console.log(`${errors.length ? 'FAIL' : 'warn '}  ${rel}`);
  for (const e of errors) console.log(`        error:   ${e}`);
  for (const w of warnings) console.log(`        warning: ${w}`);
  if (errors.length) failed++;
}

console.log(`\n${files.length} file(s), ${failed} with errors.`);
process.exit(failed ? 1 : 0);