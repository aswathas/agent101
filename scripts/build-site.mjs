// scripts/build-site.mjs
// Render the curriculum into the static site under site/.
//
// Two kinds of page:
//   * lesson pages — site/phases/NN-phase/NN-slug.html, one per docs/en.md
//   * index surfaces — index.html, catalog.html, glossary.html, sitemap.xml,
//     llms.txt, all generated from the same pass
//
// Three things this file used to get wrong, all of them visible:
//   1. It wrote the markdown into a <pre> tag. A lesson rendered as its own
//      source. There is now a real markdown renderer.
//   2. Lesson pages linked ../../../style.css. A page lives at
//      site/phases/NN-phase/NN-slug.html, so three levels up is the repo root,
//      not site/ — every lesson loaded no stylesheet at all. Depth is computed
//      now, not guessed.
//   3. The index surfaces were hand-written and rotted. They are generated.
//
// Usage:  node scripts/build-site.mjs [--check]
//   --check  render nothing; exit 1 if a generated page would change

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'site');
const CHECK = process.argv.includes('--check');

const SITE_NAME = 'Harnessing Claude Code';
const SITE_TAGLINE = 'From zero to graph engineering on AI agents — for people who use them.';
// The canonical origin for sitemap.xml and llms.txt. Override with SITE_URL
// when hosting elsewhere; the default is the GitHub Pages project URL, which is
// derived from the repository name (aswathas.github.io/<repo>).
const CANONICAL = process.env.SITE_URL || 'https://aswathas.github.io/agent101';

const LESSON_SKELETON = [/^\s*>\s*Skeleton\./m, /Replace this placeholder/];
const BRIEF_SKELETON = [/Fill this in/, /\[your artifact \+ evidence\]/];
const RUBRIC_SKELETON = [/\|\s*2\s*\|\s*Fill in\s*\|/];

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── inline markdown ─────────────────────────────────────────────────────────
function inline(s) {
  let t = esc(s);
  // Code first: its contents must not be read as emphasis or links.
  t = t.replace(/`([^`]+)`/g, (_, c) => `\u0000${c}\u0001`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => {
    const external = /^https?:/i.test(href);
    return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
  });
  t = t.replace(/\u0000([\s\S]*?)\u0001/g, (_, c) => `<code>${c}</code>`);
  return t;
}

const isBlockStart = (l) =>
  /^(#{1,6})\s/.test(l) || /^```/.test(l) || /^>\s?/.test(l) || /^\|/.test(l) ||
  /^\s*([-*]|\d+\.)\s/.test(l) || /^---+\s*$/.test(l);

// ── block markdown ──────────────────────────────────────────────────────────
function mdToHtml(src) {
  const lines = src.split(/\r?\n/);
  const out = [];
  const para = [];
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0; }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const fence = line.match(/^```(\S*)\s*$/);
    if (fence) {
      flush();
      const lang = fence[1] || '';
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      if (lang === 'mermaid') {
        out.push(`<figure class="diagram"><pre>${esc(buf.join('\n'))}</pre>`
          + `<figcaption>Mermaid source — renders as a diagram where mermaid.js is available</figcaption></figure>`);
      } else {
        out.push(`<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(buf.join('\n'))}</code></pre>`);
      }
      continue;
    }

    // heading (the H1 is rendered by the page shell, not here)
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flush();
      const lvl = h[1].length;
      if (lvl > 1) {
        const text = h[2];
        const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        out.push(`<h${lvl} id="${slug}">${inline(text)}</h${lvl}>`);
      }
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) { flush(); out.push('<hr>'); i++; continue; }

    // table
    if (/^\|/.test(line) && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] ?? '')) {
      flush();
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
      out.push('<div class="table-wrap"><table><thead><tr>'
        + head.map((c) => `<th>${inline(c)}</th>`).join('')
        + '</tr></thead><tbody>'
        + rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')
        + '</tbody></table></div>');
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      flush();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '').trim()); i++; }
      const inner = buf.filter(Boolean);
      out.push(`<blockquote>${inner.map((l) => `<p>${inline(l)}</p>`).join('')}</blockquote>`);
      continue;
    }

    // list (collect first, then emit, so continuation lines land inside the item)
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m) {
          items.push({ indent: m[1].length, ordered: /\d/.test(m[2]), text: m[3] });
          i++;
          continue;
        }
        const t = lines[i].trim();
        if (items.length && t && !isBlockStart(lines[i])) { items[items.length - 1].text += ' ' + t; i++; continue; }
        break;
      }
      const html = [];
      const stack = [];
      for (const it of items) {
        while (stack.length && it.indent < stack[stack.length - 1].indent) {
          html.push(`</li></${stack.pop().tag}>`);
        }
        if (stack.length && it.indent === stack[stack.length - 1].indent) {
          html.push('</li>');
        } else if (!stack.length || it.indent > stack[stack.length - 1].indent) {
          const tag = it.ordered ? 'ol' : 'ul';
          stack.push({ indent: it.indent, tag });
          html.push(`<${tag}>`);
        }
        const crit = /✅/.test(it.text);
        html.push(`<li${crit ? ' class="criterion"' : ''}>${inline(it.text)}`);
      }
      while (stack.length) html.push(`</li></${stack.pop().tag}>`);
      out.push(html.join(''));
      continue;
    }

    if (!line.trim()) { flush(); i++; continue; }

    para.push(line.trim());
    i++;
  }
  flush();
  return out.join('\n');
}

// ── read the corpus ─────────────────────────────────────────────────────────
function readCatalog() {
  const text = readFileSync(join(ROOT, 'CATALOG.md'), 'utf8');
  const lines = text.split(/\r?\n/);
  const phases = [];
  let phase = null;
  let awaitingThesis = false;
  let awaitingModule = false;
  let currentModule = null;

  for (const raw of lines) {
    const line = raw.trim();

    const ph = line.match(/^## Phase (\d+)\s+—\s+(.+)$/);
    if (ph) {
      phase = { num: ph[1], name: ph[2].trim(), slug: null, thesis: '', lessons: [], module: null };
      phases.push(phase);
      awaitingThesis = true;
      continue;
    }
    if (awaitingThesis && line && !line.startsWith('|') && !line.startsWith('**Module')) {
      phase.thesis = line.trim();
      awaitingThesis = false;
      continue;
    }

    const row = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*`([^`]+)`\s*\|$/);
    if (row && phase) {
      const title = row[2].replace(/\*\*/g, '').replace(/\s+—\s+.*$/, '').trim();
      const gloss = (row[2].match(/—\s+(.+)$/)?.[1] ?? '').replace(/\*\*/g, '').trim();
      const [phaseSlug, lessonSlug] = row[3].split('/');
      if (!phase.slug) phase.slug = phaseSlug;
      phase.lessons.push({ num: Number(row[1]), title, gloss, phaseSlug, lessonSlug });
      continue;
    }

    const mod = line.match(/^\*\*Module (\d+\.\d+)\*\*\s+—\s+(.+?)\s+\(`?(\w+)`?\)/);
    if (mod) {
      currentModule = { num: mod[1], title: mod[2], type: mod[3], dir: null };
      awaitingModule = true;
      continue;
    }
    if (awaitingModule && line.startsWith('→')) {
      currentModule.dir = line.replace(/^→\s*`?/, '').replace(/`$/, '').trim();
      if (phase) phase.module = currentModule;
      awaitingModule = false;
    }
  }
  return phases.filter((p) => p.slug && p.lessons.length);
}

function lessonStatus(dir) {
  const md = join(dir, 'docs', 'en.md');
  if (!existsSync(md)) return 'missing';
  return LESSON_SKELETON.some((re) => re.test(readFileSync(md, 'utf8'))) ? 'scaffold' : 'authored';
}

function moduleStatus(dir) {
  if (!dir) return 'missing';
  const b = join(ROOT, dir, 'BRIEF.md');
  const r = join(ROOT, dir, 'RUBRIC.md');
  if (!existsSync(b) || !existsSync(r)) return 'missing';
  if (BRIEF_SKELETON.some((re) => re.test(readFileSync(b, 'utf8')))) return 'scaffold';
  if (RUBRIC_SKELETON.some((re) => re.test(readFileSync(r, 'utf8')))) return 'scaffold';
  return 'authored';
}

function readLesson(dir) {
  const text = readFileSync(join(dir, 'docs', 'en.md'), 'utf8');
  const lines = text.split(/\r?\n/);
  const meta = { title: 'Untitled', type: null, prereq: null, time: null, hook: null };
  let i = 0;
  for (; i < lines.length; i++) if (lines[i].startsWith('# ')) { meta.title = lines[i].slice(2).trim(); i++; break; }
  for (; i < lines.length; i++) { const l = lines[i].trim(); if (l.startsWith('>')) { meta.hook = l.replace(/^>\s*/, ''); i++; break; } }
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('**Type:**')) meta.type = l.replace(/^\*\*Type:\*\*\s*/, '');
    if (l.startsWith('**Prerequisites:**')) meta.prereq = l.replace(/^\*\*Prerequisites:\*\*\s*/, '');
    if (l.startsWith('**Time:**')) meta.time = l.replace(/^\*\*Time:\*\*\s*/, '');
    if (l.startsWith('## ')) break;
  }
  // The hook may run over two lines; join the continuation.
  const rest = lines.slice(i).join('\n');
  return { meta, body: rest };
}

function readQuiz(dir) {
  const p = join(dir, 'quiz.json');
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8')).questions ?? []; } catch { return []; }
}

function loadCurriculum() {
  const phases = readCatalog();
  for (const p of phases) {
    for (const l of p.lessons) {
      l.dir = join(ROOT, 'phases', l.phaseSlug, l.lessonSlug);
      l.status = lessonStatus(l.dir);
      l.outPath = `phases/${l.phaseSlug}/${l.lessonSlug}.html`;
      l.url = `phases/${l.phaseSlug}/${l.lessonSlug}.html`;
      if (l.status === 'authored') {
        const { meta } = readLesson(l.dir);
        l.title = meta.title;
        l.hook = meta.hook;
      }
    }
    p.moduleStatus = moduleStatus(p.module?.dir);
    const done = p.lessons.filter((l) => l.status === 'authored').length;
    p.authored = done;
    p.total = p.lessons.length;
    p.status = done === p.total && p.moduleStatus === 'authored' ? 'complete'
      : done === 0 && p.moduleStatus !== 'authored' ? 'planned'
      : 'in-progress';
  }
  return phases;
}

// ── page shell ──────────────────────────────────────────────────────────────
const NAV = [
  ['catalog.html', 'Catalog'],
  ['glossary.html', 'Glossary'],
  ['developer.html', 'API'],
  ['llms.txt', 'llms.txt'],
];

// Runs before paint so a dark OS preference does not flash light. A ?theme=
// param wins over everything, which makes a specific theme shareable by link
// and screenshot-able without touching system settings.
const THEME_SCRIPT = `<script>(function(){var k='hcc-theme',d=document.documentElement;
try{var q=new URLSearchParams(location.search).get('theme');
var t=q||localStorage.getItem(k)||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');
if(t==='dark')d.dataset.theme='dark';}catch(e){}
window.addEventListener('DOMContentLoaded',function(){var b=document.querySelector('[data-theme-toggle]');if(!b)return;b.addEventListener('click',function(){var dark=d.dataset.theme!=='dark';if(dark)d.dataset.theme='dark';else d.removeAttribute('data-theme');try{localStorage.setItem(k,dark?'dark':'light');}catch(e){}});});})();</script>`;

/** depth = how many directories below site/ this page lives. */
function head(title, depth, description = '') {
  const p = depth ? '../'.repeat(depth) : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${SITE_NAME}</title>
<meta name="description" content="${esc(description || SITE_TAGLINE)}">
<link rel="stylesheet" href="${p}fonts.css">
<link rel="stylesheet" href="${p}style.css">
${THEME_SCRIPT}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site">
  <div class="container">
    <a class="logo" href="${p}index.html">■ HARNESSING CLAUDE CODE</a>
    <nav>${NAV.map(([h, t]) => `<a href="${p}${h}">${esc(t)}</a>`).join('')}</nav>
    <button class="theme-toggle" data-theme-toggle aria-label="Toggle colour theme" title="Toggle colour theme">◐</button>
  </div>
</header>
`;
}

const foot = `</body>\n</html>\n`;

function sidebar(cur, activeLesson) {
  return cur.map((p) => {
    const items = p.lessons.map((l) => {
      const on = activeLesson && activeLesson.phaseSlug === l.phaseSlug && activeLesson.lessonSlug === l.lessonSlug;
      return `<li${on ? ' class="on"' : ''}><a href="${'../'.repeat(2)}${l.outPath}"><span class="n">${l.num}</span>${esc(l.title)}</a></li>`;
    }).join('');
    return `<section${p.slug === activeLesson?.phaseSlug ? ' class="on"' : ''}>
      <h3>Phase ${p.num} · ${esc(p.name)}</h3>
      <ul>${items}</ul>
    </section>`;
  }).join('\n');
}

// ── lesson page ─────────────────────────────────────────────────────────────
function renderLesson(cur, l, all) {
  const { meta, body } = readLesson(l.dir);
  const quiz = readQuiz(l.dir);
  const idx = all.findIndex((x) => x.outPath === l.outPath);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const p = cur.find((x) => x.slug === l.phaseSlug);

  const quizHtml = quiz.length ? `
  <section class="quiz" id="quiz">
    <h2>Check yourself</h2>
    <p class="quiz-note">${quiz.length} question${quiz.length === 1 ? '' : 's'}. Answer before you reveal — recognising the right option is not the same as being able to produce it.</p>
    <ol class="quiz-list">
${quiz.map((q, i) => `      <li>
        <p class="q">${inline(q.prompt ?? '')}</p>
        <ol class="options" type="A">
${(q.options ?? []).map((o) => `          <li>${inline(o)}</li>`).join('\n')}
        </ol>
        <details>
          <summary>Show answer</summary>
          <p class="ans"><strong>${String.fromCharCode(65 + (Number.isInteger(q.answer) ? q.answer : 0))}.</strong> ${inline((q.options ?? [])[q.answer] ?? '')}</p>
          ${q.explanation ? `<p class="why">${inline(q.explanation)}</p>` : ''}
        </details>
      </li>`).join('\n')}
    </ol>
  </section>` : '';

  const pager = `<nav class="pager">
    ${prev ? `<a class="prev" href="${'../'.repeat(2)}${prev.outPath}"><span>Previous</span>${prev.num}. ${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a class="next" href="${'../'.repeat(2)}${next.outPath}"><span>Next</span>${next.num}. ${esc(next.title)}</a>` : '<span></span>'}
  </nav>`;

  return `${head(meta.title, 2, meta.hook ?? '')}
<div class="page">
  <aside class="toc" aria-label="All lessons">
    <p class="toc-title">All ${all.length} lessons</p>
${sidebar(cur, l)}
  </aside>

  <main id="main" class="reader">
    <article class="lesson-article">
      <p class="lesson-meta-tag">${esc((meta.type ?? 'lesson').toUpperCase())} · PHASE ${p?.num ?? '—'} · LESSON ${l.num}</p>
      <h1>${esc(meta.title)}</h1>
      ${meta.hook ? `<p class="lesson-motto">${esc(meta.hook)}</p>` : ''}

      <dl class="lesson-meta-block">
        <div><dt>Type</dt><dd>${esc(meta.type ?? '—')}</dd></div>
        <div><dt>Prerequisites</dt><dd>${esc(meta.prereq ?? '—')}</dd></div>
        <div><dt>Time</dt><dd>${esc(meta.time ?? '—')}</dd></div>
      </dl>

      <div class="ascii-rule"></div>

      <div class="prose">
${mdToHtml(body)}
      </div>
${quizHtml}
${pager}
    </article>
  </main>
</div>
${foot}`;
}

// ── index surfaces ──────────────────────────────────────────────────────────
function renderIndex(cur, totals) {
  const cards = cur.map((p) => `
      <a class="phase-card" href="phases/${p.slug}/${p.lessons[0].lessonSlug}.html">
        <div class="pc-head">
          <span class="pc-num">Phase ${p.num}</span>
          <span class="status-square ${p.status}" title="${p.status}"></span>
        </div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.thesis)}</p>
        <p class="pc-meta">${p.total} lessons${p.module ? ` · module ${esc(p.module.num)} <em>${esc(p.module.type)}</em>` : ''}</p>
      </a>`).join('\n');

  return `${head('Home', 0, SITE_TAGLINE)}
<main id="main" class="container">
  <section id="start" class="hero">
    <p class="lesson-meta-tag">HARNESSING / CLAUDE CODE</p>
    <h1>${esc(SITE_TAGLINE)}</h1>
    <p class="lesson-motto">A free, open-source course. ${totals.lessons} lessons across ${totals.phases} phases, ${totals.modules} graded practice modules. MCP, hooks, plugins, worktree isolation, dynamic workflows, harness engineering, task graphs.</p>

    <p class="hero-actions">
      <a class="button" href="phases/00-setup-and-tooling/01-dev-environment.html">Start with Lesson 1 →</a>
      <a class="button ghost" href="catalog.html">See the whole map</a>
    </p>

    <ul class="stats">
      <li><strong>${totals.lessons}</strong><span>lessons</span></li>
      <li><strong>${totals.phases}</strong><span>phases</span></li>
      <li><strong>${totals.modules}</strong><span>practice modules</span></li>
      <li><strong>${totals.questions}</strong><span>quiz questions</span></li>
    </ul>

    <div class="ascii-rule"></div>

    <p class="lede">Every abstraction in Claude Code resolves to something you can reason about, break, and rebuild. This course teaches the mechanism — not the prompt.</p>
  </section>

  <section id="why">
    <h2>Why this course exists</h2>
    <p>Most agentic tooling is taught in two broken ways: as a list of features, or as prompts to copy. Neither teaches the <em>mechanism</em>. The same fear — losing work to an agent run — drives both failures. The fix is to know what the agent is doing. This course is that.</p>
  </section>

  <section id="phases">
    <h2>The 19 phases</h2>
    <div class="phase-grid">
${cards}
    </div>
  </section>

  <section id="agent-skills">
    <h2>Teaching it to yourself, with an agent</h2>
    <p>This repo is designed to be pointed at an AI agent. The <a href="developer.html">MCP server and REST API</a> are the agent entry points. Five skills, each invoked deliberately by the learner:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Command</th><th>Does</th></tr></thead>
      <tbody>
        <tr><td><code>/teach-me</code></td><td>Teach one lesson, at the learner's actual level</td></tr>
        <tr><td><code>/run-module</code></td><td>Start or grade a practice module against its rubric</td></tr>
        <tr><td><code>/where-am-i</code></td><td>What's demonstrated, what's next</td></tr>
        <tr><td><code>/write-lesson</code></td><td>Author a new lesson to template</td></tr>
        <tr><td><code>/run-workflow</code></td><td>Author the corpus, validate it, rebuild this site</td></tr>
      </tbody>
    </table></div>
  </section>
</main>
${foot}`;
}

function renderCatalog(cur, totals) {
  const body = cur.map((p) => {
    const items = p.lessons.map((l) => {
      const sq = l.status === 'authored' ? 'complete' : 'planned';
      return `      <li><span class="status-square ${sq}"></span> <a href="${l.outPath}">${l.num}. ${esc(l.title)}</a>${l.gloss ? ` — ${esc(l.gloss)}` : ''}</li>`;
    }).join('\n');
    const mod = p.module
      ? `<p class="mod"><span class="status-square ${p.moduleStatus === 'authored' ? 'complete' : 'planned'}"></span> Practice module ${esc(p.module.num)} — ${esc(p.module.title)} <em>(${esc(p.module.type)})</em></p>`
      : '';
    return `    <section class="cat-phase">
    <h2><span class="status-square ${p.status}"></span> Phase ${p.num} — ${esc(p.name)}</h2>
    <p>${esc(p.thesis)}</p>
    <ol class="cat-lessons">
${items}
    </ol>
${mod}
    </section>`;
  }).join('\n\n');

  return `${head('Catalog', 0, `All ${totals.lessons} lessons across ${totals.phases} phases`)}
<main id="main" class="container">
  <article class="lesson-article">
    <p class="lesson-meta-tag">CATALOG / ALL LESSONS</p>
    <h1>${totals.lessons} lessons across ${totals.phases} phases</h1>
    <p class="lesson-motto">Each lesson is a single claim you can act on. The phase structure is the dependency graph; the path is the URL.</p>
    <p>${totals.authored} of ${totals.lessons} lessons are authored, and ${totals.modulesAuthored} of ${totals.modules} practice modules are written.
    For the agent-readable form see <a href="llms.txt">llms.txt</a>; for the API see <a href="developer.html">developer.html</a>.</p>

${body}
  </article>
</main>
${foot}`;
}

function keyTermsOf(l) {
  if (l.status !== 'authored') return [];
  const md = readFileSync(join(l.dir, 'docs', 'en.md'), 'utf8');
  const section = /^## Key Terms\b([\s\S]*?)(?=^## |\Z)/m.exec(md)?.[1] ?? '';
  return section.split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\|/.test(line) && !/^\|\s*-+/.test(line) && !/\|\s*(Term|What people say|What it actually means)\s*\|/i.test(line))
    .map((line) => line.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((cells) => cells.length >= 3 && cells[0]);
}

function renderGlossary(cur) {
  const groups = cur.map((p) => {
    const rows = p.lessons.flatMap((l) => keyTermsOf(l).map((cells) => ({ l, cells })));
    if (!rows.length) return '';
    const trs = rows.map(({ l, cells }) =>
      `        <tr><td><strong>${inline(cells[0])}</strong></td><td>${inline(cells[1])}</td><td>${inline(cells[2])}</td><td><a href="${l.outPath}">${l.num}</a></td></tr>`).join('\n');
    return `    <section class="cat-phase">
      <h2>Phase ${p.num} — ${esc(p.name)}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Term</th><th>What people say</th><th>What it actually means</th><th>Lesson</th></tr></thead>
        <tbody>
${trs}
        </tbody>
      </table></div>
    </section>`;
  }).filter(Boolean).join('\n\n');

  const count = cur.flatMap((p) => p.lessons).reduce((n, l) => n + keyTermsOf(l).length, 0);
  return `${head('Glossary', 0, `${count} key terms and the misconception each one corrects`)}
<main id="main" class="container">
  <article class="lesson-article">
    <p class="lesson-meta-tag">GLOSSARY</p>
    <h1>Every key term, and the misconception it corrects</h1>
    <p class="lesson-motto">${count} terms, aggregated from the Key Terms table of every lesson. The middle column is the point: it names the wrong intuition in the same breath as the definition.</p>
${groups || '    <p>No authored lessons yet.</p>'}
  </article>
</main>
${foot}`;
}

function renderSitemap(cur) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    '', 'catalog.html', 'glossary.html', 'developer.html', 'llms.txt',
    ...cur.flatMap((p) => p.lessons.filter((l) => l.status === 'authored').map((l) => l.outPath)),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${CANONICAL}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
}

function renderLlms(cur, totals) {
  const phases = cur.map((p) => {
    const lessons = p.lessons.map((l) =>
      `- [${l.title}](${l.outPath})${l.gloss ? ` — ${l.gloss}` : ''}${l.status === 'authored' ? '' : ' _(scaffold)_'}`).join('\n');
    return `## Phase ${p.num}: ${p.name}\n${p.thesis}\n\n${lessons}`;
  }).join('\n\n');

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}
> ${totals.lessons} lessons across ${totals.phases} phases. The path is the URL.

Canonical site: ${CANONICAL}
Lessons authored: ${totals.authored} of ${totals.lessons}. Practice modules: ${totals.modulesAuthored} of ${totals.modules}.

## Lesson URL scheme

\`/phases/NN-phase-slug/NN-lesson-slug.html\` — every lesson is one directory at this path. The path is the URL.
Source of truth: \`phases/NN-phase-slug/NN-lesson-slug/docs/en.md\`.

## Developer resources

- [Developer documentation](developer.html) — public read-only API, MCP server, errors, quotas, versioning
- [OpenAPI 3.1](openapi.json) — typed REST operations
- [MCP manifest](server.json) — Streamable HTTP
- [Catalog](catalog.html) — all ${totals.lessons} lessons
- [Glossary](glossary.html) — every key term across authored lessons
- [Sitemap](sitemap.xml) — canonical URL inventory

## Plugin surface (for agents)

- Streamable HTTP MCP at \`/mcp\` — tools: \`search_curriculum\`, \`read_resource\` (read-only)
- REST API: \`/api/v1/catalog\`, \`/api/v1/resource?path=…\`, \`/api/v1/markdown?path=…\`
- OpenAPI: \`/openapi.json\`; MCP manifest: \`/server.json\` (also \`/.well-known/mcp.json\`)
- Content negotiation: \`Accept: text/markdown\` on any page returns the markdown twin
- All routes are static; no auth, no accounts, no write endpoints

## Lessons

${phases}
`;
}

// ── write ───────────────────────────────────────────────────────────────────
function ensureDir(p) { mkdirSync(p, { recursive: true }); }

let changed = 0;
function writeOut(rel, content) {
  const target = join(SITE, rel);
  const before = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (before === content) return false;
  if (CHECK) { console.error(`would change: site/${rel}`); return true; }
  ensureDir(dirname(target));
  writeFileSync(target, content);
  return true;
}

const curriculum = loadCurriculum();
const allLessons = curriculum.flatMap((p) => p.lessons);
const totals = {
  phases: curriculum.length,
  lessons: allLessons.length,
  authored: allLessons.filter((l) => l.status === 'authored').length,
  modules: curriculum.filter((p) => p.module).length,
  modulesAuthored: curriculum.filter((p) => p.moduleStatus === 'authored').length,
  questions: allLessons.reduce((n, l) => n + (l.status === 'authored' ? readQuiz(l.dir).length : 0), 0),
};

console.log(`Building ${totals.lessons} lesson pages (${totals.authored} authored, ${totals.questions} quiz questions)…`);

for (const p of curriculum) {
  for (const l of p.lessons) {
    if (l.status !== 'authored') continue;
    if (writeOut(l.outPath, renderLesson(curriculum, l, allLessons))) changed++;
  }
}

// A page for a lesson that is back to being a scaffold would publish the
// placeholder as if it were the lesson. Delete anything no longer expected.
const expected = new Set(allLessons.filter((l) => l.status === 'authored').map((l) => l.outPath));
const phasesRoot = join(SITE, 'phases');
if (existsSync(phasesRoot)) {
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!entry.endsWith('.html')) continue;
      const rel = full.replace(SITE, '').replace(/\\/g, '/').replace(/^\//, '');
      if (expected.has(rel)) continue;
      if (CHECK) { console.error(`would remove: site/${rel}`); changed++; continue; }
      rmSync(full);
      changed++;
    }
  };
  walk(phasesRoot);
}

for (const [rel, html] of [
  ['index.html', renderIndex(curriculum, totals)],
  ['catalog.html', renderCatalog(curriculum, totals)],
  ['glossary.html', renderGlossary(curriculum)],
  ['sitemap.xml', renderSitemap(curriculum)],
  ['llms.txt', renderLlms(curriculum, totals)],
]) {
  if (writeOut(rel, html)) changed++;
}

if (CHECK) {
  console.log(changed ? `${changed} file(s) would change.` : 'site is up to date.');
  process.exit(changed ? 1 : 0);
}
console.log(`Done. ${changed} file(s) written under site/.`);
