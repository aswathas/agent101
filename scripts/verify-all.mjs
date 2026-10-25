#!/usr/bin/env node
// verify-all.mjs — the single "is this project actually finished?" gate.
//
// Runs every check the workflow promises, in the order that makes a failure
// readable: is anything still a scaffold, does every phase pass the template
// validator, does the committed site match the corpus, and is the corpus
// internally consistent (titles, quiz shape, practice modules present).
//
// Exit 0 only when every check passes. Anything else is a specific reason to
// keep authoring, printed as such.
//
// Usage:  node scripts/verify-all.mjs [--json]

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { allGaps, describeGap, lessonDirs } from './lib/workflow-lib.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const AS_JSON = process.argv.includes('--json');

const run = (script, args = []) =>
  spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT, encoding: 'utf8', shell: false,
  });

const checks = [];
const add = (name, ok, detail = '') => checks.push({ name, ok, detail });

// ── 1. nothing is still a scaffold ──────────────────────────────────────────
const gaps = allGaps(ROOT);
const open = gaps.filter((g) => g.hasGap);
add('no scaffolds remain', open.length === 0,
  open.map((g) => `${g.phase}: ${describeGap(g)}`).join('; '));

// ── 2. every phase passes the template validator ────────────────────────────
const bad = [];
for (const phase of gaps.map((g) => g.phase)) {
  const res = run('validate-lessons.mjs', [phase]);
  if (res.status !== 0) {
    const first = (res.stderr || res.stdout || '').split('\n').find((l) => l.trim().startsWith('- '));
    bad.push(`${phase}${first ? ` (${first.trim()})` : ''}`);
  }
}
add('every phase passes validate-lessons.mjs', bad.length === 0, bad.join('; '));

// ── 3. the committed site matches the corpus ────────────────────────────────
const site = run('build-site.mjs', ['--check']);
add('site is not stale', site.status === 0, (site.stderr || '').split('\n').slice(0, 4).join(' | '));

// ── 4. every referenced webfont is actually present ─────────────────────────
// The stylesheet names three families. For a long time nothing loaded them and
// the site silently rendered in Georgia and Consolas. A missing .woff2 is a
// silent regression, so check the files the CSS points at.
const fontsCss = join(ROOT, 'site', 'fonts.css');
const fontProblems = [];
if (!existsSync(fontsCss)) {
  fontProblems.push('site/fonts.css is missing — run scripts/fetch-fonts.mjs');
} else {
  for (const m of readFileSync(fontsCss, 'utf8').matchAll(/url\('([^']+)'\)/g)) {
    const file = join(ROOT, 'site', m[1]);
    if (!existsSync(file) || statSync(file).size === 0) fontProblems.push(m[1]);
  }
}
add('every referenced webfont is present', fontProblems.length === 0, fontProblems.join(', '));

// ── 5. the palette is readable in both themes ───────────────────────────────
const contrast = run('check-contrast.mjs', []);
add('palette clears WCAG AA in both themes', contrast.status === 0,
  (contrast.stdout || '').split('\n').filter((l) => l.includes('✗') || /worst/.test(l)).join(' | '));

// ── 6. corpus consistency ───────────────────────────────────────────────────
const problems = [];
let lessons = 0;
for (const { phase } of gaps) {
  for (const slug of lessonDirs(ROOT, phase)) {
    lessons++;
    const label = `${phase}/${slug}`;
    const md = join(ROOT, 'phases', phase, slug, 'docs', 'en.md');
    const quiz = join(ROOT, 'phases', phase, slug, 'quiz.json');

    const title = existsSync(md) ? readFileSync(md, 'utf8').match(/^#\s+(.+)$/m)?.[1]?.trim() : null;
    if (!title) problems.push(`${label}: no H1 title`);

    if (!existsSync(quiz)) {
      problems.push(`${label}: no quiz.json`);
      continue;
    }
    try {
      const q = JSON.parse(readFileSync(quiz, 'utf8'));
      if (!Array.isArray(q.questions) || q.questions.length === 0) {
        problems.push(`${label}: quiz has no questions`);
      }
    } catch (e) {
      problems.push(`${label}: quiz.json is not valid JSON`);
    }
  }
}

// Every phase that CATALOG.md points at must have a written module.
for (const mod of readdirSync(join(ROOT, 'practice'))) {
  if (mod === 'TEMPLATE') continue;
  const dir = join(ROOT, 'practice', mod);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of ['BRIEF.md', 'RUBRIC.md']) {
    if (!existsSync(join(dir, f))) problems.push(`practice/${mod}: missing ${f}`);
  }
}
add('corpus consistency (titles, quizzes, modules)', problems.length === 0, problems.slice(0, 6).join('; '));

// ── report ──────────────────────────────────────────────────────────────────
const authored = lessons - open.reduce((n, g) => n + g.openLessonBodies, 0);

if (AS_JSON) {
  console.log(JSON.stringify({ authored, lessons, checks }, null, 2));
} else {
  console.log(`verify-all: ${authored}/${lessons} lessons authored\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? '✓' : '✗'} ${c.name}`);
    if (!c.ok && c.detail) console.log(`      ${c.detail}`);
  }
  console.log('');
  console.log(checks.every((c) => c.ok) ? 'project complete.' : 'project NOT complete.');
}

process.exit(checks.every((c) => c.ok) ? 0 : 1);
