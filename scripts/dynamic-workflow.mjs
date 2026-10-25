#!/usr/bin/env node
// dynamic-workflow.mjs — one entry point for the whole authoring pipeline:
// status → author (in isolated worktrees) → validate → build site.
//
// Each step is allowed to fail loudly so the next is never fed garbage. This
// script only orchestrates; the worker in write-phase.mjs writes prose, and the
// validator decides whether that prose is finished.
//
// What changed from the first version, and why:
//   * `--phases` was accepted and then ignored — it filtered `order` and then
//     passed every phase to the authoring step anyway. Now the filter is
//     applied to the set of phases that actually have gaps.
//   * The publish step called publish-site.mjs, a second renderer that writes
//     `site/<phase-slug>/...`. The maintained site is build-site.mjs writing
//     `site/phases/...`. Running both left two half-sites in one directory.
//     build-site.mjs is the one wired in.
//   * "Was it authored?" is now the same gap check the worker and the status
//     report use (scripts/lib/workflow-lib.mjs), not a word-count guess.
//
// Usage:
//   node scripts/dynamic-workflow.mjs [--concurrency N] [--phases a,b,c]
//                                     [--worker claude|opencode] [--status-only]
//                                     [--skip-site] [--dry-run]
//
// Exit: 0 every step succeeded; 1 planning failed; 2 authoring failed;
//       3 validation failed; 4 site build failed; 5 verification failed.

import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const argv = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : argv[i + 1];
};
const has = (f) => argv.includes(f);

const CONCURRENCY = get('--concurrency', '3');
const WORKER = get('--worker', 'claude');
const PHASES = get('--phases', null);
const STATUS_ONLY = has('--status-only');
const SKIP_SITE = has('--skip-site');
const DRY = has('--dry-run');

const log = (...m) => console.log('\n══════ ' + m.join(' '));
const node = (script, args = [], opts = {}) =>
  spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT, stdio: 'inherit', shell: false, ...opts,
  });

// ── Step 1: what is actually left ───────────────────────────────────────────
function status() {
  log('status: which phases still have gaps');
  // exit 0 = complete, 1 = gaps remain. Both are fine here; 1 just means work.
  // The status report takes one phase per call, so honour --phases by looping.
  if (PHASES) {
    let complete = true;
    for (const p of PHASES.split(',').map((s) => s.trim())) {
      if (node('workflow-status.mjs', ['--phase', p]).status !== 0) complete = false;
    }
    return complete;
  }
  return node('workflow-status.mjs', []).status === 0;
}

// ── Step 2: author each phase in its own worktree, merge in catalog order ───
function author() {
  const args = ['--concurrency', CONCURRENCY, '--worker', WORKER];
  if (PHASES) args.push('--phases', PHASES);
  if (DRY) args.push('--dry-run');
  log('author: fan one worker per phase, isolate in worktrees, merge in order');
  const res = node('author-phases.mjs', args);
  // 4 = nothing needed. That is a success for this pipeline, not a failure.
  if (res.status !== 0 && res.status !== 4) throw new Error(`authoring failed (exit ${res.status})`);
  return res.status === 4;
}

// ── Step 3: validate ────────────────────────────────────────────────────────
// The validator takes one phase per call (it scopes practice modules by the
// phase number), so validate the phases this run touched, one at a time. With
// no --phases, that is the whole corpus.
function validate() {
  const phases = PHASES ? PHASES.split(',').map((s) => s.trim()) : null;
  const list = phases ?? readdirSync(join(ROOT, 'phases')).sort();
  log(`validate: ${list.length} phase(s) against LESSON-TEMPLATE.md`);
  const bad = [];
  for (const p of list) {
    const res = node('validate-lessons.mjs', [p]);
    if (res.status !== 0) bad.push(p);
  }
  if (bad.length) throw new Error('validation failed: ' + bad.join(', '));
}

// ── Step 4: render the site ─────────────────────────────────────────────────
function buildSite() {
  log('site: render every lesson page');
  const res = node('build-site.mjs', []);
  if (res.status !== 0) throw new Error('site build failed');
}

// ── Step 5: the end-to-end gate ─────────────────────────────────────────────
function verify() {
  log('verify: the project-complete gate');
  const res = node('verify-all.mjs', []);
  if (res.status !== 0) throw new Error('verification failed');
}

// ── drive ───────────────────────────────────────────────────────────────────
try {
  const complete = status();
  if (STATUS_ONLY) {
    console.log(complete ? '\n=== corpus complete.' : '\n=== corpus has gaps.');
    process.exit(complete ? 0 : 1);
  }

  const nothingToDo = author();
  if (!nothingToDo) validate();
  else console.log('\nnothing authored this run; validating what exists.');

  if (!SKIP_SITE) buildSite();
  verify();

  console.log('\n=== done: every step succeeded.');
  process.exit(0);
} catch (err) {
  console.error('\n=== FAILED:', err.message);
  const code = /planning/.test(err.message) ? 1
    : /authoring/.test(err.message) ? 2
    : /validation/.test(err.message) ? 3
    : /site/.test(err.message) ? 4
    : /verification/.test(err.message) ? 5
    : 2;
  process.exit(code);
}
