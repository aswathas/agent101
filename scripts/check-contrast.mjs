#!/usr/bin/env node
// check-contrast.mjs — every text pair in the palette must clear WCAG AA.
//
// A palette change looks fine to the person making it and fails for someone
// reading in daylight on a laptop at 40% brightness. This reads the real tokens
// out of site/style.css and measures the pairs that actually carry text, in
// both themes.
//
// It caught a real one: the first Void & Violet pass put white text on the
// dark-mode accent — #ffffff on #a78bfa, 2.72:1, well under the 4.5 floor. The
// fix is the --on-accent token, which flips to near-black in dark mode.
//
// Usage:  node scripts/check-contrast.mjs [--json]
// Exit:   0 every pair passes, 1 otherwise.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CSS = join(ROOT, 'site', 'style.css');

const AA = 4.5;

function tokens(selector) {
  const css = readFileSync(CSS, 'utf8');
  const i = css.indexOf(selector);
  if (i === -1) throw new Error(`site/style.css has no "${selector}" block`);
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  const out = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const light = tokens(':root');
const dark = { ...light, ...tokens('[data-theme="dark"]') };

const rgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = (c) => {
  const [r, g, b] = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** Flatten an rgba() onto a solid background, so tinted surfaces measure as rendered. */
function flatten(color, base) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const [r, g, b, a = 1] = m[1].split(',').map((x) => Number(x.trim()));
  const [br, bg, bb] = rgb(base);
  const mix = (c, d) => Math.round(c * a + d * (1 - a));
  return `#${[mix(r, br), mix(g, bg), mix(b, bb)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// The pairs that actually carry text. Decorative marks (status squares, rules)
// are excluded — they are not read, they are seen.
const PAIRS = [
  ['body text on the page', 'ink', 'bg'],
  ['body text on a surface', 'ink', 'bg-surface'],
  ['body text in a code block', 'ink', 'code-bg'],
  ['secondary text on the page', 'ink-soft', 'bg'],
  ['small-caps label on the page', 'ink-mute', 'bg'],
  ['small-caps label on a surface', 'ink-mute', 'bg-surface'],
  ['link / accent on the page', 'blueprint', 'bg'],
  ['link / accent on a surface', 'blueprint', 'bg-surface'],
  ['text on a filled button', 'on-accent', 'blueprint'],
];

const results = [];
for (const [themeName, t] of [['light', light], ['dark', dark]]) {
  for (const [label, fgKey, bgKey] of PAIRS) {
    const fg = t[`--${fgKey}`];
    const bg = flatten(t[`--${bgKey}`], t['--bg']);
    if (!fg || !bg) {
      results.push({ theme: themeName, label, error: `missing token --${fgKey} or --${bgKey}` });
      continue;
    }
    const r = ratio(fg, bg);
    results.push({ theme: themeName, label, ratio: Number(r.toFixed(2)), pass: r >= AA, fg, bg });
  }
}

const failures = results.filter((r) => r.error || !r.pass);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ standard: `WCAG AA ${AA}:1`, results, failures: failures.length }, null, 2));
} else {
  for (const theme of ['light', 'dark']) {
    console.log(`\n${theme}`);
    for (const r of results.filter((x) => x.theme === theme)) {
      if (r.error) { console.log(`  ✗   ${'—'.padStart(6)}  ${r.label}  (${r.error})`); continue; }
      console.log(`  ${r.pass ? '✓' : '✗'} ${r.ratio.toFixed(2).padStart(6)}  ${r.label}  (${r.fg} on ${r.bg})`);
    }
  }
  const worst = results.filter((r) => r.ratio).reduce((m, r) => Math.min(m, r.ratio), Infinity);
  console.log(`\n${results.length} pairs checked, ${failures.length} below ${AA}:1. worst ${worst.toFixed(2)}:1.`);
}

process.exit(failures.length ? 1 : 0);
