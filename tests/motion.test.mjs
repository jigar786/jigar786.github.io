import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, scripts, attr } from './helpers.mjs';

const html = readDist('index.html');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n').replace(/\s+/g, '');

test('consistent, tighter section spacing from one token', () => {
  assert.match(css, /--space-section:clamp\(3rem,6vw,4\.5rem\)/);
  assert.match(css, /\.section\{[^}]*padding-block:var\(--space-section\)/);
});

test('animations exist and only run for people who allow motion', () => {
  const motionBlock = css.indexOf('@media(prefers-reduced-motion:no-preference)');
  assert.ok(motionBlock > -1, 'animations must be gated by prefers-reduced-motion: no-preference');
  assert.match(css, /@keyframes[\w-]*rise/);
  assert.match(css, /@keyframes[\w-]*pulse/);
  const firstAnimation = css.search(/animation:[^;}]*rise/);
  assert.ok(firstAnimation > motionBlock, 'rise animation must be inside the reduced-motion gate');
});

test('scroll reveal is CSS-only progressive enhancement', () => {
  assert.match(css, /@supports\(animation-timeline:view\(\)\)/);
  assert.match(html, /class="[^"]*\breveal\b/);
  const inline = scripts(html).filter((s) => attr(s.open, 'type') !== 'application/ld+json');
  assert.equal(inline.length, 1, 'no extra JavaScript for animations');
  assert.doesNotMatch(inline[0].body, /IntersectionObserver/);
});

test('hero entrance is staggered', () => {
  const rise = [...html.matchAll(/class="[^"]*\brise\b[^"]*"[^>]*style="--i:\s*(\d)"/g)].map((m) => Number(m[1]));
  assert.ok(rise.length >= 4, `expected ≥4 staggered hero elements, got ${rise.length}`);
});
