#!/usr/bin/env node
// author-phases.mjs — fan one authoring worker per phase, isolate it in a git
// worktree, and merge the results back in catalog order.
//
// Replaces write-all-phases.mjs, whose three bugs each cost a run:
//   1. it measured "committed?" against a hardcoded `main`, so on any other
//      branch every worker looked like it had committed nothing;
//   2. it decided "authored?" with a single scaffold marker, so a phase with a
//      finished body and a placeholder quiz counted as done;
//   3. it shelled out to `git merge`, letting cmd.exe re-split the message.
//
// Design notes, because they are the whole point:
//   * Branches drift and merges worsen, so merges happen in catalog order,
//     immediately, in the main checkout — not at the end of a long fan-out.
//   * Isolation without a commit is a backup of nothing. A worker that exits 0
//     with no `feat()` commit is treated as a failure, every time.
//   * The unit of work is a *phase*, because a phase is one boundary in the
//     concept spine (COURSE-CONTEXT.md) and lessons inside it ground each
//     other. Two phases in one worker would let the later one lean on a
//     concept the earlier one hasn't written yet.
//
// Usage:
//   node scripts/author-phases.mjs [--concurrency N] [--phases a,b,c]
//                                  [--base <ref>] [--worker claude|opencode]
//                                  [--dry-run] [--keep-worktrees] [--force]
//
// Exit: 0 every selected phase merged and validates; 2 a worker failed;
//       3 a merged phase failed validation; 4 no phases needed work.

import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { allGaps, describeGap } from './lib/workflow-lib.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const argv = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : argv[i + 1];
};
const flag = (f) => argv.includes(f);

const CONCURRENCY = Math.max(1, Number(get('--concurrency', '3')));
const WORKER = get('--worker', 'claude');
const FORCE = flag('--force');
const DRY = flag('--dry-run');
const KEEP = flag('--keep-worktrees');
const PHASES_ARG = get('--phases', null);

// Array form, shell off. `shell: true` hands cmd.exe a string it re-splits on
// spaces and quotes — the merge message and any path under a directory with a
// space both break on it.
const git = (args, opts = {}) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', shell: false, ...opts });
const gitIn = (dir, args, opts = {}) => spawnSync('git', args, { cwd: dir, encoding: 'utf8', shell: false, ...opts });

const BASE = get('--base', null) || git(['rev-parse', 'HEAD']).stdout.trim();
const BRANCH = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
// Hyphen sibling of the session branch: `X-wf-08-hooks`. A slash child of `X`
// cannot exist — git keeps refs as files, so `refs/heads/X` and
// `refs/heads/X/Y` collide.
const prefix = BRANCH === 'HEAD' ? 'wf' : `${BRANCH}-wf`;
const branchFor = (phase) => `${prefix}-${phase}`;
const worktreeFor = (phase) => join(ROOT, '.claude', 'worktrees', phase);

// ── select ───────────────────────────────────────────────────────────────────
const wanted = PHASES_ARG ? new Set(PHASES_ARG.split(',').map((s) => s.trim())) : null;
let gaps = allGaps(ROOT);
if (wanted) gaps = gaps.filter((g) => wanted.has(g.phase));
const selected = FORCE ? gaps : gaps.filter((g) => g.hasGap);

console.log(`base ${BASE.slice(0, 8)} on ${BRANCH}, worker=${WORKER}, concurrency=${CONCURRENCY}`);
for (const g of gaps) {
  const mark = selected.includes(g) ? '→ author' : '  skip  ';
  console.log(`  ${mark}  ${g.phase.padEnd(30)} ${describeGap(g)}`);
}

if (!selected.length) {
  console.log('\nnothing to author — every selected phase is complete.');
  process.exit(4);
}
if (DRY) {
  console.log(`\n[dry-run] would author ${selected.length} phase(s).`);
  process.exit(0);
}

// ── workspace ────────────────────────────────────────────────────────────────
function prepareWorktree(phase) {
  const dir = worktreeFor(phase);
  const branch = branchFor(phase);
  mkdirSync(join(ROOT, '.claude', 'worktrees'), { recursive: true });

  // A leftover directory from a killed run blocks `worktree add`. Clear it.
  if (existsSync(dir)) {
    git(['worktree', 'remove', '--force', dir]);
    if (existsSync(dir)) gitIn(ROOT, ['clean', '-fdx', '--', join('.claude', 'worktrees', phase)]);
  }
  git(['worktree', 'prune']);
  git(['branch', '-D', branch]);

  const res = git(['worktree', 'add', '-b', branch, dir, BASE]);
  if (res.status !== 0) throw new Error(`worktree add failed for ${phase}: ${res.stderr}`);
  return { dir, branch };
}

// ── author one phase ─────────────────────────────────────────────────────────
function author(phase) {
  return new Promise((resolve) => {
    let wt;
    try {
      wt = prepareWorktree(phase);
    } catch (e) {
      return resolve({ phase, ok: false, reason: e.message });
    }

    const before = gitIn(wt.dir, ['rev-parse', 'HEAD']).stdout.trim();
    console.log(`\n=== ${phase} → ${wt.dir}`);

    // 'node' by name, no shell. The Windows install path contains a space
    // ("C:\Program Files\nodejs\node.exe"); shell:true hands cmd an unquoted
    // argv and every worker dies ENOENT before it starts.
    const child = spawn(
      'node',
      [join(wt.dir, 'scripts', 'write-phase.mjs'), phase, '--worker', WORKER],
      { cwd: wt.dir, stdio: 'inherit', shell: false },
    );
    child.on('error', () => resolve({ phase, ok: false, reason: 'spawn failed', ...wt }));
    child.on('close', (code) => {
      const after = gitIn(wt.dir, ['rev-parse', 'HEAD']).stdout.trim();
      const committed = after !== before;
      const subject = gitIn(wt.dir, ['log', '-1', '--format=%s']).stdout.trim();
      console.log(`=== ${phase}: exit=${code} committed=${committed} "${subject}"`);
      resolve({
        phase, ...wt, code, committed,
        // The commit is the contract, not the exit code. opencode has exited
        // non-zero after committing a perfectly good phase (phase 12), and
        // skipping that merge threw away 3259 lines of validated work. Whether
        // the content is any good is the post-merge validator's call.
        ok: committed,
        reason: committed ? null : `worker exited ${code} without committing`,
      });
    });
  });
}

// ── merge one phase back, immediately, in catalog order ──────────────────────
function mergeOne({ phase, branch, committed, ok, dir, reason }) {
  if (!ok) {
    console.log(`SKIP ${phase}: ${reason}`);
    return { phase, merged: false, validated: false, reason };
  }
  const subject = gitIn(dir, ['log', '-1', '--format=%s', branch]).stdout.trim();
  const res = git(['merge', '--no-ff', '-m', `merge(${phase}): ${subject}`, branch]);
  if (res.status !== 0) {
    console.log(`CONFLICT ${phase}\n${res.stderr}`);
    return { phase, merged: false, validated: false, reason: 'merge conflict' };
  }
  console.log(`merged ${phase}`);

  // The worker ran the validator inside its worktree, but a merge can combine
  // cleanly and still leave a phase inconsistent. Trust the post-merge tree.
  const v = spawnSync(process.execPath, [join(ROOT, 'scripts', 'validate-lessons.mjs'), phase], {
    cwd: ROOT, stdio: 'inherit', shell: false,
  });
  if (v.status !== 0) console.log(`VALIDATION FAILED after merging ${phase}`);
  return { phase, merged: true, validated: v.status === 0, reason: v.status === 0 ? null : 'validation failed post-merge' };
}

// ── drive: waves so a dozen headless sessions don't stampede one machine ─────
const results = [];
for (let i = 0; i < selected.length; i += CONCURRENCY) {
  const wave = selected.slice(i, i + CONCURRENCY);
  console.log(`\n───── wave ${Math.floor(i / CONCURRENCY) + 1}: ${wave.map((w) => w.phase).join(', ')}`);
  const authored = await Promise.all(wave.map((g) => author(g.phase)));
  // Merge in catalog order, one at a time, as each wave finishes. Branches
  // drift and merges worsen; the longer they sit, the worse the merge.
  for (const r of authored) results.push({ ...r, ...mergeOne(r) });
}

if (!KEEP) {
  for (const r of results) {
    if (r.dir) git(['worktree', 'remove', '--force', r.dir]);
    git(['branch', '-D', r.branch]);
  }
  git(['worktree', 'prune']);
}

// ── summary ─────────────────────────────────────────────────────────────────
const merged = results.filter((r) => r.merged);
const failed = results.filter((r) => !r.merged);
const unvalidated = results.filter((r) => r.merged && !r.validated);

console.log('\n══════ summary ══════');
console.log(`authored + merged: ${merged.length}`);
for (const r of merged) console.log(`  ✓ ${r.phase}${r.validated ? '' : '  (merged, validation failed)'}`);
if (failed.length) {
  console.log(`not merged: ${failed.length}`);
  for (const r of failed) console.log(`  ✗ ${r.phase}: ${r.reason}`);
}

console.log('\nnext: node scripts/workflow-status.mjs');
process.exit(failed.length ? 2 : unvalidated.length ? 3 : 0);
