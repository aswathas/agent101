#!/usr/bin/env node
// serve-site.mjs — serve site/ locally, with zero dependencies.
//
// The site is static, but "static" here still needs a server: the lesson pages
// use relative links, and site/developer.html documents a REST API and
// `Accept: text/markdown` content negotiation that a bare file open cannot
// honour. This serves the directory, and implements the endpoints the site
// claims to have, so the documented API is real rather than aspirational.
//
// No package.json, no install, no build step. Node's http module only.
//
// Usage:
//   node scripts/serve-site.mjs [--port 4180] [--host 127.0.0.1]
//
// Endpoints
//   GET /                                site/index.html
//   GET /phases/NN-phase/NN-slug.html    a lesson page
//   GET /api/v1/catalog?q=&phase=&limit= search the curriculum (JSON)
//   GET /api/v1/resource?path=phases/..  a lesson's markdown source
//   GET /api/v1/markdown?path=/catalog   a site page's markdown twin
//   GET /.well-known/mcp.json            the MCP manifest
//   Accept: text/markdown on a lesson    returns its markdown source

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, extname, dirname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'site');

const argv = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : argv[i + 1];
};
const PORT = Number(get('--port', process.env.PORT || 4180));
const HOST = get('--host', '127.0.0.1');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// ── curriculum index, built once ────────────────────────────────────────────
function buildIndex() {
  const phasesDir = join(ROOT, 'phases');
  const lessons = [];
  for (const phase of readdirSync(phasesDir).sort()) {
    const pdir = join(phasesDir, phase);
    if (!statSync(pdir).isDirectory()) continue;
    for (const slug of readdirSync(pdir).sort()) {
      const dir = join(pdir, slug);
      if (!statSync(dir).isDirectory()) continue;
      const md = join(dir, 'docs', 'en.md');
      if (!existsSync(md)) continue;
      const text = readFileSync(md, 'utf8');
      const scaffold = /^\s*>\s*Skeleton\./m.test(text);
      lessons.push({
        path: `phases/${phase}/${slug}`,
        url: `phases/${phase}/${slug}.html`,
        phase,
        number: Number(slug.split('-')[0]),
        title: (text.match(/^#\s+(.+)$/m)?.[1] ?? slug).trim(),
        type: (text.match(/^\*\*Type:\*\*\s*(.+)$/m)?.[1] ?? '').trim() || null,
        hook: (text.match(/^>\s*(.+)$/m)?.[1] ?? '').trim() || null,
        words: text.split(/\s+/).filter(Boolean).length,
        authored: !scaffold,
      });
    }
  }
  return lessons;
}

const CURRICULUM = buildIndex();

const json = (res, code, body) => {
  const text = JSON.stringify(body, null, 2);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(text) });
  res.end(text);
};

/** Resolve a URL path inside `base`, refusing anything that escapes it. */
function safeJoinIn(base, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const full = join(base, clean);
  if (full !== base && !full.startsWith(base + sep)) return null;
  return full;
}
const safeJoin = (urlPath) => safeJoinIn(SITE, urlPath);

const server = createServer((req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host ?? HOST}`); }
  catch { return json(res, 400, { code: 'bad_request', detail: 'unparseable URL' }); }

  const p = url.pathname;
  const wantsMarkdown = /\btext\/markdown\b/.test(req.headers.accept ?? '');

  // ── API ───────────────────────────────────────────────────────────────────
  if (p === '/api/v1/catalog') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const phase = url.searchParams.get('phase');
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 100) || 100, 100);
    const results = CURRICULUM
      .filter((l) => !phase || l.phase === phase)
      .filter((l) => !q || l.title.toLowerCase().includes(q) || l.hook?.toLowerCase().includes(q) || l.path.includes(q))
      .slice(0, limit);
    return json(res, 200, { count: results.length, total: CURRICULUM.length, lessons: results });
  }

  if (p === '/api/v1/resource') {
    const path = url.searchParams.get('path');
    if (!path) return json(res, 400, { code: 'missing_path', detail: 'path is required', hint: 'e.g. phases/00-setup-and-tooling/01-dev-environment' });
    // Lesson markdown lives at the repo root, not under site/ — the pages are
    // rendered copies, the source is phases/NN-phase/NN-slug/docs/en.md.
    const md = safeJoinIn(ROOT, `/${path}/docs/en.md`);
    if (!md || !existsSync(md)) return json(res, 404, { code: 'not_found', detail: `no lesson at ${path}` });
    const text = readFileSync(md, 'utf8');
    res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8' });
    return res.end(text);
  }

  if (p === '/api/v1/markdown') {
    const path = (url.searchParams.get('path') ?? '/').replace(/^\//, '');
    const base = path === '' ? 'index' : path.replace(/\.html$/, '');
    const twin = safeJoin(`/${base}.md`);
    if (twin && existsSync(twin)) {
      res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8' });
      return res.end(readFileSync(twin, 'utf8'));
    }
    // No hand-written twin: synthesise one from the HTML so the promise holds.
    const html = safeJoin(`/${base}.html`);
    if (html && existsSync(html)) {
      const text = readFileSync(html, 'utf8')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
      res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8' });
      return res.end(text);
    }
    return json(res, 404, { code: 'not_found', detail: `no markdown twin for ${path}` });
  }

  if (p === '/.well-known/mcp.json') {
    const m = safeJoin('/server.json');
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(existsSync(m) ? readFileSync(m, 'utf8') : '{}');
  }

  // ── content negotiation on lesson pages ───────────────────────────────────
  const lessonMatch = p.match(/^\/phases\/([^/]+)\/([^/]+)\.html$/);
  if (lessonMatch && wantsMarkdown) {
    const md = safeJoinIn(ROOT, `/phases/${lessonMatch[1]}/${lessonMatch[2]}/docs/en.md`);
    if (md && existsSync(md)) {
      res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8' });
      return res.end(readFileSync(md, 'utf8'));
    }
  }

  // ── static files ──────────────────────────────────────────────────────────
  let target = safeJoin(p);
  if (!target) return json(res, 403, { code: 'forbidden', detail: 'path escapes the site root' });

  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  if (!existsSync(target) && !extname(target)) target = `${target}.html`;

  if (!existsSync(target) || statSync(target).isDirectory()) {
    const notFound = join(SITE, '404.html');
    const body = existsSync(notFound)
      ? readFileSync(notFound)
      : Buffer.from(`<!doctype html><meta charset="utf-8"><title>404</title>`
        + `<body style="font:16px/1.6 system-ui;padding:3rem;max-width:40rem;margin:auto">`
        + `<h1>404</h1><p>No page at <code>${p}</code>.</p><p><a href="/">Home</a> · <a href="/catalog.html">Catalog</a></p>`);
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(body);
  }

  const type = TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream';
  const body = readFileSync(target);
  res.writeHead(200, { 'content-type': type, 'content-length': body.length });
  res.end(body);
});

server.listen(PORT, HOST, () => {
  console.log(`site served from ${SITE}`);
  console.log(`  http://${HOST}:${PORT}/`);
  console.log(`  ${CURRICULUM.filter((l) => l.authored).length}/${CURRICULUM.length} lessons authored`);
  console.log('  API: /api/v1/catalog · /api/v1/resource?path=… · /api/v1/markdown?path=…');
});
