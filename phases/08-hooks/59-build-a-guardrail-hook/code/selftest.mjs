#!/usr/bin/env node
// Runs guardrail.mjs against fabricated events and asserts the exit code.
// No Claude Code, no settings file, no session. This is the file that tells
// you which way the guardrail fails before the agent does.
//
//   node selftest.mjs
//
// Exits non-zero if any case fails, so it works as an npm script.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const guardrail = join(here, 'guardrail.mjs');

const pre = (tool_name, tool_input) => ({ hook_event_name: 'PreToolUse', tool_name, tool_input });

const cases = [
  { name: 'allows git status',             event: pre('Bash', { command: 'git status' }),                     expect: 0 },
  { name: 'allows push --force-with-lease', event: pre('Bash', { command: 'git push --force-with-lease' }),  expect: 0 },
  { name: 'allows Read under dist/',      event: pre('Read', { file_path: '/repo/dist/app.js' }),           expect: 0 },
  { name: 'ignores a PostToolUse event',  event: { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'git push' } }, expect: 0 },
  { name: 'survives missing tool_input',  event: { hook_event_name: 'PreToolUse', tool_name: 'Bash' },     expect: 0 },
  { name: 'blocks git push',              event: pre('Bash', { command: 'git push origin main' }),         expect: 2 },
  { name: 'blocks git push --force',      event: pre('Bash', { command: 'git push --force' }),             expect: 2 },
  { name: 'blocks git reset --hard',      event: pre('Bash', { command: 'git reset --hard HEAD~1' }),      expect: 2 },
  { name: 'blocks rm -rf',                event: pre('Bash', { command: 'rm -rf /tmp/x' }),               expect: 2 },
  { name: 'blocks Write under dist/',     event: pre('Write', { file_path: '/repo/dist/app.js' }),        expect: 2 },
  { name: 'blocks Edit of a .min.js',     event: pre('Edit', { file_path: '/repo/public/app.min.js' }),    expect: 2 },
];

let failed = 0;
for (const c of cases) {
  const run = spawnSync(process.execPath, [guardrail], {
    input: JSON.stringify(c.event),
    encoding: 'utf8',
  });
  const ok = run.status === c.expect;
  if (!ok) failed++;
  const detail = ok ? '' : ` — stderr: ${(run.stderr || '').trim() || '(none)'}`;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${c.name} (exit ${run.status}, want ${c.expect})${detail}`);
}

console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);