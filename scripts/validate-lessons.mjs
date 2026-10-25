#!/usr/bin/env node
// validate-lessons.mjs — check every lesson matches LESSON-TEMPLATE.md.
//
// Catches the failure modes that are invisible when reading and obvious later:
// ungrounded forward references, wrong reframe count, exercises without pass
// criteria, and quiz.json shapes that break machine readers.
//
// Usage:  node scripts/validate-lessons.mjs [phase-slug]
// Exit 0 if every lesson passes, 1 otherwise.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PHASES_DIR = join(ROOT, 'phases');

// Terms that must NOT appear in a lesson unless a prerequisite phase taught them.
// Keyed by lesson index — the value is the earliest phase that grounds it.
const GROUNDING = [
  { phase: '00-setup-and-tooling', lesson: '01', forbidden: /\bMCP\b|\bhooks?\b|\bskills?\b|\bsubagents?\b|\bplugins?\b|\bworktree\b|\bisolation\b|context window|\bparallel/i },
];

const REQUIRED_SECTIONS = [
  '**Type:**',
  '**Prerequisites:**',
  '**Time:**',
  '## Learning Objectives',
  '## The Problem',
  '## The Concept',
  '## Build It',
  '## Use It',
  '## Exercises',
  '## Key Terms',
];

// A pass criterion is a line starting with ✅ OR a line beginning "Pass:".
// Two valid forms: the emoji form (template default) and "Pass:" (acceptable).
// The substance — a stated observable outcome — is what matters.
const CRITERION = /^\s*(?:[-*]\s*)?(?:✅|Pass:)/gm;

// Scaffold markers. A skeleton satisfies every structural rule above — it has
// all ten sections, one reframe, two criteria — so the checks below passed all
// 119 lessons while 118 were empty. Structure is not authorship. These strings
// appear in a template and in nothing an author would write.
const SKELETON = [
  [/^\s*>\s*Skeleton\./m, 'unwritten scaffold'],
  [/Replace this placeholder/, 'unwritten scaffold'],
  [/You pass when <observable state>/, 'unwritten scaffold'],
  [/^\s*\| — \| — \|/m, 'empty table row'],
];

const QUIZ_PLACEHOLDER = [/^Replace with a question/, /^Replace me$/];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
  }
  return out;
}

function findLessons(phaseFilter) {
  if (!existsSync(PHASES_DIR)) return [];
  const phases = readdirSync(PHASES_DIR).filter((p) => !phaseFilter || p === phaseFilter);
  return phases.flatMap((p) =>
    readdirSync(join(PHASES_DIR, p))
      .map((l) => ({ phase: p, lesson: l, dir: join(PHASES_DIR, p, l) }))
      .filter(({ dir }) => statSync(dir).isDirectory()),
  );
}

const problems = [];
const lessons = findLessons(process.argv[2]);

if (!lessons.length) {
  console.log('No lessons found.');
  process.exit(0);
}

for (const { phase, lesson, dir } of lessons) {
  const label = `${phase}/${lesson}`;
  const mdPath = join(dir, 'docs', 'en.md');

  if (!existsSync(mdPath)) {
    problems.push(`${label}: missing docs/en.md`);
    continue;
  }

  const md = readFileSync(mdPath, 'utf8');

  for (const section of REQUIRED_SECTIONS) {
    if (!md.includes(section)) problems.push(`${label}: missing required section "${section.trim()}"`);
  }

  // A title line, checked as a line rather than a substring. The old entry was
  // the literal '# ', which is satisfied by every '## ' section heading — so
  // four Phase 04 lessons lost their H1 and still passed, publishing "Untitled"
  // as their name on the site.
  if (!/^#\s+\S/m.test(md)) problems.push(`${label}: missing the '# ' title line`);

  // The one-line hook under the title. Template: '> One line. What is different
  // after this lesson that wasn't before.' Seven Phase 04 lessons shipped
  // without it, so the title read as the whole introduction.
  const afterTitle = md.slice(md.search(/^#\s+\S/m)).split(/\r?\n/).slice(1);
  const firstContent = afterTitle.find((l) => l.trim());
  if (firstContent && !firstContent.trim().startsWith('>')) {
    problems.push(`${label}: no '>' hook line under the title`);
  }

  // Exactly one reframe.
  const reframes = md.match(/\*\*The reframe:/g) ?? [];
  if (reframes.length !== 1) {
    problems.push(`${label}: has ${reframes.length} explicit reframes, template requires exactly 1`);
  }

  // Every exercise needs an observable pass criterion. Scoped to the Exercises
  // section — "Build It" also uses a numbered list, and counting those says
  // nothing about whether exercises are checkable.
  const exercisesSection = /^## Exercises\b([\s\S]*?)(?=^## |\Z)/m.exec(md)?.[1] ?? '';
  const exerciseCount = (exercisesSection.match(/^\s*\d+\.\s/gm) ?? []).length;
  const criteria = exercisesSection.match(CRITERION) ?? [];
  if (exerciseCount > 0 && criteria.length < exerciseCount) {
    problems.push(`${label}: ${exerciseCount} exercises but ${criteria.length} pass criteria (✅ "You pass when…" or "Pass: …")`);
  }

  // No unfilled authoring placeholders.
  if (/<<\s*(YOU WRITE THIS|TODO|TBD)/i.test(md)) {
    problems.push(`${label}: contains an unfilled authoring placeholder`);
  }

  // Structure is not authorship — reject an unwritten scaffold. One report per
  // lesson: three hits means one unwritten lesson, not three separate defects.
  if (SKELETON.some(([re]) => re.test(md))) {
    problems.push(`${label}: unwritten scaffold — run /write-lesson`);
  }

  // Grounding: ungrounded forward references.
  const key = `${phase}/${lesson.split('-')[0]}`;
  const rule = GROUNDING.find((g) => `${g.phase}/${g.lesson.split('-')[0]}` === key);
  if (rule) {
    const found = md.match(rule.forbidden);
    if (found) {
      const unique = [...new Set(found.map((f) => f.toLowerCase()))];
      problems.push(`${label}: ungrounded term(s) ${unique.join(', ')} — must be established before use`);
    }
  }

  // quiz.json must be machine-readable: every question needs options[] and an
  // in-range integer answer. A boolean answer breaks any reader that assumes a
  // uniform shape.
  const quizPath = join(dir, 'quiz.json');
  if (existsSync(quizPath)) {
    try {
      const quiz = JSON.parse(readFileSync(quizPath, 'utf8'));
      for (const q of quiz.questions ?? []) {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          problems.push(`${label}: quiz ${q.id} has no options[] — readers assume a uniform shape`);
        } else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
          problems.push(`${label}: quiz ${q.id} answer ${JSON.stringify(q.answer)} out of range for ${q.options.length} options`);
        }
        if (!q.explanation) problems.push(`${label}: quiz ${q.id} has no explanation`);
        // A valid-shaped quiz full of placeholders is still unwritten.
        if (QUIZ_PLACEHOLDER.some((re) => (q.options ?? []).some((o) => re.test(o)))
            || QUIZ_PLACEHOLDER[0].test(q.prompt ?? '')) {
          problems.push(`${label}: quiz ${q.id} is an unwritten scaffold`);
        }
      }
    } catch (err) {
      problems.push(`${label}: quiz.json is not valid JSON — ${err.message}`);
    }
  }
}

// Practice modules carry the same scaffold the lessons did, and nothing above
// was looking at them. A BRIEF still reading "Fill this in" is not a brief.
const PRACTICE_DIR = join(ROOT, 'practice');
const BRIEF_SKELETON = [/Fill this in/, /\[your artifact \+ evidence\]/];

if (existsSync(PRACTICE_DIR)) {
  // A phase filter must scope the modules too, or `validate-lessons.mjs 04`
  // reports 18 unrelated unwritten modules and the phase looks unfinished
  // forever. Module dirs are prefixed with the phase number they belong to.
  const phaseNum = process.argv[2]?.slice(0, 2);
  for (const mod of readdirSync(PRACTICE_DIR)) {
    const dir = join(PRACTICE_DIR, mod);
    if (mod === 'TEMPLATE' || !statSync(dir).isDirectory()) continue;
    if (phaseNum && !mod.startsWith(phaseNum)) continue;
    for (const file of ['BRIEF.md', 'RUBRIC.md']) {
      const p = join(dir, file);
      if (!existsSync(p)) {
        problems.push(`practice/${mod}: missing ${file}`);
        continue;
      }
      const text = readFileSync(p, 'utf8');
      const hits = file === 'BRIEF.md'
        ? BRIEF_SKELETON.filter((re) => re.test(text))
        : [/\|\s*2\s*\|\s*Fill in\s*\|/].filter((re) => re.test(text));
      if (hits.length) problems.push(`practice/${mod}/${file}: unwritten scaffold`);
    }
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`${lessons.length} lesson(s) pass.`);