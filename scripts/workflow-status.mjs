#!/usr/bin/env node
// workflow-status.mjs — what is actually left to author, per phase.
//
// Exits 0 when every phase is complete, 1 when anything is still open. That
// exit code is what lets a shell loop keep dispatching work until the corpus
// is done, instead of guessing from a word count.
//
// Usage:  node scripts/workflow-status.mjs [--json] [--phase <slug>]
//
// This is a read-only report. It never writes and never spawns anything.

import { allGaps, phaseGap, describeGap, gapFiles, allPhases } from './lib/workflow-lib.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const pi = argv.indexOf('--phase');
const only = pi === -1 ? null : argv[pi + 1];

const gaps = only ? [phaseGap(ROOT, only)] : allGaps(ROOT);

if (asJson) {
  console.log(JSON.stringify(gaps, null, 2));
  process.exit(gaps.some((g) => g.hasGap) ? 1 : 0);
}

let open = 0;
let lessonBodies = 0;
let quizzes = 0;
let modules = 0;
let totalLessons = 0;

const rows = gaps.map((g) => {
  totalLessons += g.lessons.length;
  lessonBodies += g.openLessonBodies;
  quizzes += g.openQuizzes;
  modules += g.openModule;
  if (g.hasGap) open++;
  return [
    g.phase,
    String(g.lessons.length),
    `${g.lessons.length - g.openLessonBodies}/${g.lessons.length}`,
    g.openQuizzes ? String(g.openQuizzes) : '-',
    g.openModule ? 'open' : 'done',
    describeGap(g),
  ];
});

const head = ['phase', 'lessons', 'bodies', 'quizzes', 'module', 'gap'];
const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ');

console.log(line(head));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const r of rows) console.log(line(r));

console.log('');
console.log(`phases total:      ${gaps.length}`);
console.log(`phases with gaps:  ${open}`);
console.log(`lesson bodies open ${lessonBodies} of ${totalLessons}`);
console.log(`quizzes open       ${quizzes}`);
console.log(`module files open  ${modules}`);

if (open) {
  console.log('');
  console.log('files still to author:');
  for (const g of gaps.filter((x) => x.hasGap)) {
    for (const f of gapFiles(ROOT, g)) console.log(`  ${f}`);
  }
}

process.exit(open ? 1 : 0);
