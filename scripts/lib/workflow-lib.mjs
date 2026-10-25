// scripts/lib/workflow-lib.mjs
// Shared gap detection for the authoring workflow.
//
// The old workflow decided "is this phase done?" with a single `git grep` for
// one scaffold marker. That is wrong in both directions: a lesson with a real
// body but a placeholder quiz.json reads as done, and a phase with one
// unwritten lesson reads as fully authored. The validator already knows the
// real markers — this module is the same set, exposed as data so the
// orchestrator, the status report and the worker prompt all agree.
//
// Three kinds of gap, because they cost different amounts of work:
//   lesson body   — an unwritten scaffold in docs/en.md
//   quiz          — a placeholder or missing quiz.json
//   module        — an unwritten practice/{BRIEF,RUBRIC}.md
//
// Everything here is read-only. Nothing writes.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Same strings the validator rejects. Kept in sync deliberately; if the
// validator grows a marker, this list is the second place to update.
export const LESSON_SKELETON = [/^\s*>\s*Skeleton\./m, /Replace this placeholder/];
export const QUIZ_PLACEHOLDER = [/Replace with a question/, /^Replace me$/m, /Replace me$/m];
export const BRIEF_SKELETON = [/Fill this in/, /\[your artifact \+ evidence\]/];
export const RUBRIC_SKELETON = [/\|\s*2\s*\|\s*Fill in\s*\|/];

const hits = (text, patterns) => patterns.some((re) => re.test(text));

/** Which practice module belongs to a phase. Modules are prefixed NN-. */
export function moduleDirFor(root, phase) {
  const num = phase.slice(0, 2);
  const dir = join(root, 'practice');
  if (!existsSync(dir)) return null;
  const name = readdirSync(dir)
    .filter((m) => m !== 'TEMPLATE' && m.startsWith(num))
    .find((m) => statSync(join(dir, m)).isDirectory());
  return name ? join(dir, name) : null;
}

/** Lesson directories under phases/<phase>/, sorted. */
export function lessonDirs(root, phase) {
  const dir = join(root, 'phases', phase);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((l) => statSync(join(dir, l)).isDirectory())
    .sort();
}

/**
 * Everything missing from one phase.
 * @returns {{phase:string, lessons:Array<{slug:string, body:boolean, quiz:'real'|'placeholder'|'missing'}>,
 *            module:{dir:string|null, brief:boolean, rubric:boolean}, openLessonBodies:number,
 *            openQuizzes:number, openModule:number, hasGap:boolean}}
 */
export function phaseGap(root, phase) {
  const lessons = lessonDirs(root, phase).map((slug) => {
    const md = join(root, 'phases', phase, slug, 'docs', 'en.md');
    const body = !existsSync(md) || hits(readFileSync(md, 'utf8'), LESSON_SKELETON);
    const qp = join(root, 'phases', phase, slug, 'quiz.json');
    const quiz = !existsSync(qp)
      ? 'missing'
      : hits(readFileSync(qp, 'utf8'), QUIZ_PLACEHOLDER) ? 'placeholder' : 'real';
    return { slug, body, quiz };
  });

  const dir = moduleDirFor(root, phase);
  const read = (f) => (dir && existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8') : '');
  const module = {
    dir,
    brief: dir ? hits(read('BRIEF.md'), BRIEF_SKELETON) : false,
    rubric: dir ? hits(read('RUBRIC.md'), RUBRIC_SKELETON) : false,
  };

  const openLessonBodies = lessons.filter((l) => l.body).length;
  const openQuizzes = lessons.filter((l) => l.quiz !== 'real').length;
  const openModule = (module.brief ? 1 : 0) + (module.rubric ? 1 : 0);

  return {
    phase, lessons, module, openLessonBodies, openQuizzes, openModule,
    hasGap: openLessonBodies > 0 || openQuizzes > 0 || openModule > 0,
  };
}

/** Every phase directory, in catalog order (lexicographic = catalog order). */
export function allPhases(root) {
  const dir = join(root, 'phases');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((p) => statSync(join(dir, p)).isDirectory()).sort();
}

export function allGaps(root) {
  return allPhases(root).map((p) => phaseGap(root, p));
}

/** One-line human summary of a gap, used by status and by the worker prompt. */
export function describeGap(gap) {
  const parts = [];
  if (gap.openLessonBodies) parts.push(`${gap.openLessonBodies} lesson ${gap.openLessonBodies === 1 ? 'body' : 'bodies'}`);
  if (gap.openQuizzes) parts.push(`${gap.openQuizzes} ${gap.openQuizzes === 1 ? 'quiz' : 'quizzes'}`);
  if (gap.openModule) parts.push('module');
  return parts.length ? parts.join(', ') : 'complete';
}

/** Exact file list a worker must produce, so a prompt can name it and mean it. */
export function gapFiles(root, gap) {
  const files = [];
  for (const l of gap.lessons) {
    const base = `phases/${gap.phase}/${l.slug}`;
    if (l.body) files.push(`${base}/docs/en.md`);
    if (l.quiz !== 'real') files.push(`${base}/quiz.json`);
  }
  if (gap.module.dir) {
    const rel = gap.module.dir.replace(/\\/g, '/').split('/').slice(-2).join('/');
    if (gap.module.brief) files.push(`${rel}/BRIEF.md`);
    if (gap.module.rubric) files.push(`${rel}/RUBRIC.md`);
  }
  return files;
}
