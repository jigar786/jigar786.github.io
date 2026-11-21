import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { readDist, distPath, tags, attr } from './helpers.mjs';

const html = readDist('index.html');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ open: `<a${m[1]}>`, text: m[2].replace(/<[^>]+>/g, '').trim() }));

test('Inter is the typeface, self-hosted (no third-party font requests)', () => {
  assert.match(css, /font-family:\s*["']?Inter Variable/);
  assert.match(css, /@font-face/);
  assert.ok(readdirSync(distPath('_astro')).some((f) => f.endsWith('.woff2')), 'no woff2 in dist/_astro');
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
});

test('no monospace or forced-case styling', () => {
  assert.doesNotMatch(css, /monospace|ui-monospace|Menlo/);
  assert.doesNotMatch(css, /text-transform:\s*(uppercase|lowercase)/);
  assert.doesNotMatch(html, /class="[^"]*\bmono\b/);
});

test('navigation uses Title Case', () => {
  const nav = anchors.filter((a) => ['#experience', '#projects', '#contact'].includes(attr(a.open, 'href'))).map((a) => a.text);
  for (const label of nav) assert.match(label, /^[A-Z]/, `nav label "${label}"`);
  assert.match(html, /<summary[^>]*>Menu<\/summary>/);
});

test('consistent US spelling', () => {
  assert.doesNotMatch(html, /\b(optimis|organis|organisation)/i);
});
