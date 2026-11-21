import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, scripts, attr } from './helpers.mjs';
import { profile } from '../src/data/profile.ts';

const html = readDist('index.html');
const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)[1];
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&');

test('screen readers get one static, complete headline', () => {
  const srOnly = h1.match(/<span[^>]*class="[^"]*\bsr-only\b[^"]*"[^>]*>([^<]*)<\/span>/);
  assert.ok(srOnly, 'no sr-only phrase in h1');
  assert.equal(srOnly[1].trim(), `${profile.headline.accent}.`);
  assert.match(h1, /<span[^>]*\bdata-rotate=[^>]*aria-hidden="true"|<span[^>]*aria-hidden="true"[^>]*\bdata-rotate=/);
});

test('rotator carries every phrase and reserves space for the longest (no layout shift)', () => {
  const m = h1.match(/data-rotate="([^"]*)"/);
  assert.ok(m, 'no data-rotate');
  assert.deepEqual(JSON.parse(decode(m[1])), profile.headline.rotating);
  // Every phrase gets an invisible sizer in the same grid cell, so the box always fits the widest one.
  for (const phrase of profile.headline.rotating) {
    assert.match(h1, new RegExp(`class="[^"]*\\bsizer\\b[^"]*"[^>]*>${phrase}\\.?<`), `no sizer for "${phrase}"`);
  }
  assert.match(h1, new RegExp(`class="[^"]*\\btyped\\b[^"]*"[^>]*>${profile.headline.accent}<`), 'no-JS fallback shows first phrase');
});

test('typing runs in the single inline script and respects reduced motion', () => {
  const inline = scripts(html).filter((s) => attr(s.open, 'type') !== 'application/ld+json');
  assert.equal(inline.length, 1);
  assert.match(inline[0].body, /data-rotate/);
  assert.match(inline[0].body, /prefers-reduced-motion/);
});

test('hero says where I work now', () => {
  assert.match(html.replace(/<[^>]+>/g, ''), /Currently at Handelnine Global/);
});

test('hero info row is prominent: icons, readable weight, current company in bold', () => {
  const meta = html.match(/<ul\b[^>]*class="[^"]*\bmeta\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
  assert.ok(meta, 'meta should be a list');
  const items = [...meta[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  assert.equal(items.length, 3);
  for (const item of items) assert.match(item, /<svg\b[^>]*aria-hidden="true"/, 'each item has an icon');
  assert.match(items[2], /<strong[^>]*>Handelnine Global<\/strong>/);
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('').replace(/\s+/g, '');
  const rule = css.match(/\.meta\[[^\]]*\]\{([^}]*)\}|\.meta\{([^}]*)\}/);
  const body = rule[1] ?? rule[2];
  assert.match(body, /font-weight:500/);
  assert.match(body, /color:var\(--muted\)/);
  assert.match(body, /font-size:1rem/);
});
