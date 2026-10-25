#!/usr/bin/env node
// write-phase.mjs — author one phase's *missing* pieces with one headless worker.
//
// One worker per phase, each isolated in its own git worktree and its own
// branch, each required to commit. Isolation without a commit is not a backup —
// that scar is recorded in AGENTS.md, and it was earned twice: a previous run
// left phase 08 and phase 09 fully written and completely uncommitted.
//
// The prompt is gap-scoped. It names the exact files that are not yet authored
// and says nothing about the ones that are. A worker told to "rewrite the phase"
// re-does finished work and introduces diffs nobody asked for; a worker told
// "write these eleven quiz.json files" finishes in one pass.
//
// Usage:  node scripts/write-phase.mjs <phase-slug> [--worker claude|opencode] [--dry-run]
//
// Exit:   0 worker ran and committed; 1 no work needed; 2 worker failed; 3 no commit.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { phaseGap, describeGap, gapFiles } from './lib/workflow-lib.mjs';

// cwd IS the worktree this worker owns. The prompt must name *that* path, not
// the main checkout — an absolute path pointing at main makes every worker
// overwrite every other worker's files. That collision cost one phase of work.
const ROOT = process.cwd();
const argv = process.argv.slice(2);
const phase = argv.find((a) => !a.startsWith('--'));
const wi = argv.indexOf('--worker');
const WORKER = wi === -1 ? 'claude' : argv[wi + 1];
const DRY = argv.includes('--dry-run');

if (!phase || !existsSync(`${ROOT}/phases/${phase}`)) {
  console.error(`usage: node scripts/write-phase.mjs <phase-slug> [--worker claude|opencode]`);
  process.exit(2);
}

const gap = phaseGap(ROOT, phase);
const files = gapFiles(ROOT, gap);

if (!gap.hasGap) {
  console.log(`${phase}: nothing to author (${describeGap(gap)})`);
  process.exit(1);
}

const PROMPT = `
You are authoring lessons for a curriculum repo. Your working directory is
${ROOT} — a git worktree you own exclusively.

**Only write inside that directory.** Do not touch any other checkout. Every
other worker has its own worktree and every merge conflict you cause gets
hand-fixed.

## Your assignment — phase \`${phase}\`

Author **only these files**. They are the ones still unwritten. Everything else
in this phase is finished, validated, and must not be touched:

${files.map((f) => `- \`${f}\``).join('\n')}

Gap summary: ${describeGap(gap)}.

### docs/en.md — the full lesson body

Structure is fixed by \`LESSON-TEMPLATE.md\`. Required sections, in order:
title, a one-line '>' hook, \`**Type:**\`, \`**Prerequisites:**\`, \`**Time:**\`,
\`## Learning Objectives\`, \`## The Problem\`, \`## The Concept\`, \`## Build It\`,
\`## Use It\`, \`## Exercises\`, \`## Key Terms\`. No placeholder text survives.

### quiz.json — machine-readable checks

Shape: \`{"questions":[{"id":1,"prompt":"...","options":["a","b","c","d"],"answer":2,"explanation":"..."}]}\`.
Every question needs 4 options, an integer \`answer\` index in range, and an
\`explanation\` that says why the right answer is right *and* why the tempting
wrong one is wrong.

### practice BRIEF.md / RUBRIC.md

A brief states the task and a real constraint. A rubric's criteria are
observable — a grader can point at the artifact and say yes or no, not "feels
good".

## Read these first, in order

1. \`LESSON-TEMPLATE.md\` — the structure. The structure IS the product.
2. \`CATALOG.md\` — your phase's entry. Each lesson row states its promise.
3. \`COURSE-CONTEXT.md\` — the concept spine and the grounding rule.
4. \`MISSION.md\` and \`NOTES.md\` — who the learner is and how they learn.
5. \`AGENTS.md\` — the teaching brief.
6. Two or three sibling lessons from EARLIER phases, to match voice and depth.

## Non-negotiable rules

**Ground before leaning.** A lesson may only use a concept an earlier lesson
established. Phases 00-03 exist so 04-18 don't collapse. If you need a term the
reader hasn't met, ground it inline in a sentence or two, or cut it. Check the
"concept spine" in COURSE-CONTEXT.md for what is safe to assume.

**One reframe per lesson.** Exactly one \`**The reframe:**\` line. Not ten.

**Problem before definition.** Open with consequence. Real incident, not a
hypothetical. The reader must feel the pain in a sentence before the concept.

**Every exercise gets a pass criterion.** A line starting with ✅ containing
"You pass when" and an observable state. If you can't write one, the exercise
is too vague — rewrite it.

**Plain words.** Fragments fine. Code stays normal.
Bad:  "The worktree abstraction provides isolation for concurrent modification."
Good: "Each agent gets its own folder. Nobody steps on anyone."

**Cite, don't assert.** Claude Code ships weekly and model IDs age fast. Teach
aliases (\`sonnet\`, \`opus\`), never hardcoded versions. Link
https://code.claude.com/docs/llms.txt and date anything version-gated.

**Quiz on use, not recognition.** Every question needs a new situation, not
"what did this lesson say".

**Say what you skipped.** Name anything deliberately not covered, and when to
come back for it.

## Verify before you finish

Run: \`node scripts/validate-lessons.mjs ${phase}\`

It must pass. It checks required sections, the reframe count, exercise pass
criteria, and quiz shape. Fix everything it reports, re-run until clean.

## Commit (mandatory)

\`\`\`
git add -A phases/${phase} practice
git commit -m "feat(${phase}): author lesson bodies"
\`\`\`

Work inside ${ROOT}. A session that ends without a commit loses all of its work.
Do not push; do not merge; do not touch git refs other than your own branch.
`;

if (DRY) {
  console.log(`[dry-run] ${phase}: would author ${files.length} file(s)`);
  console.log(PROMPT);
  process.exit(0);
}

// Absolute path, no shell: on Windows the CLI lives under "C:\Program Files\...",
// and shell:true makes cmd split that on the space and fail for every worker.
// Prompt goes on stdin: passing it as an argv string loses it to shell quoting.
// acceptEdits blocks Bash, and a worker that can't `git commit` returns with
// nothing — isolation without a commit is not a backup.
const CLAUDE = process.env.CLAUDE_BIN || 'C:/Users/aswat/.local/bin/claude.exe';

function runClaude() {
  return spawnSync(
    CLAUDE,
    [
      '-p',
      '--permission-mode', 'acceptEdits',
      '--allowedTools', 'Read,Write,Edit,Glob,Grep,Bash,TodoWrite',
      '--dangerously-skip-permissions',
      '--model', process.env.AUTHOR_MODEL || 'sonnet',
      '--max-turns', '300',
    ],
    { cwd: ROOT, stdio: ['pipe', 'inherit', 'inherit'], input: PROMPT, shell: false },
  );
}

// `spawn` with shell:false cannot run npm's Windows shims — `opencode` on PATH
// resolves to opencode.ps1, CreateProcess finds no .exe, and the worker dies
// ENOENT having printed nothing. Point at the real binary instead.
function opencodeBin() {
  if (process.env.OPENCODE_BIN) return process.env.OPENCODE_BIN;
  if (process.platform === 'win32' && process.env.APPDATA) {
    const exe = `${process.env.APPDATA}\\npm\\node_modules\\@opencode\\cli\\bin\\opencode.exe`;
    if (existsSync(exe)) return exe;
  }
  return 'opencode';
}

// `opencode` must be given piped stdio, not inherited. With `stdio: 'inherit'`
// it dies before printing anything and returns status null — the process is
// killed, not failed, so there is no exit code and no error to read. Claude
// tolerates inherit; opencode does not. Pipe both streams and echo them here.
function runOpencode() {
  // `opencode run` takes the prompt as one argv element; no shell, so the
  // prompt's quotes and backticks survive intact.
  const res = spawnSync(
    opencodeBin(),
    ['run', '--model', process.env.AUTHOR_MODEL || 'opencode-go/deepseek-v4.1-flash', PROMPT],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: false, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
  );
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if (res.error) console.error(`opencode spawn error: ${res.error.message}`);
  if (res.status === null) console.error(`opencode was killed (signal ${res.signal ?? 'unknown'})`);
  return res;
}

const res = WORKER === 'opencode' ? runOpencode() : runClaude();

// Exit 0 with nothing committed is a silent failure. Check the ref.
const head = spawnSync('git', ['log', '-1', '--format=%H%n%s'], { cwd: ROOT, encoding: 'utf8' }).stdout;
const [sha, subject = ''] = head.trim().split('\n');
const base = spawnSync('git', ['rev-parse', `${sha}^`], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
console.log(`\n=== ${phase}: worker=${WORKER} exit=${res.status} head="${subject}"`);

if (res.status !== 0) process.exit(2);
if (!/^feat\(/.test(subject)) {
  console.log(`=== ${phase}: worker did not commit a feat() change — treating as failure`);
  process.exit(3);
}
void base;
process.exit(0);
