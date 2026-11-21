import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readDist } from './helpers.mjs';

const html = readDist('index.html');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n').replace(/\s+/g, '');
const src = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('no grid background in any theme', () => {
  assert.doesNotMatch(css, /--grid-line/);
  assert.doesNotMatch(css, /body\{[^}]*linear-gradient\(/);
});

test('both themes: soft glow at the top', () => {
  assert.match(css, /body\{[^}]*background-image:radial-gradient\([^;]*var\(--glow\)/);
});

test('both themes: fine dots that fade out down the page', () => {
  const before = css.match(/body:+before\{([^}]*)\}/);
  assert.ok(before, 'no body::before layer');
  assert.match(before[1], /radial-gradient\([^;]*var\(--dot\)/);
  assert.match(before[1], /mask-image:linear-gradient\(/);
  assert.match(before[1], /pointer-events:none/);
});

test('glow and dot colors are tuned per theme', () => {
  const dark = src.slice(src.indexOf(':root {'), src.indexOf('}', src.indexOf(':root {')));
  const light = src.slice(src.indexOf(":root[data-theme='light']"), src.indexOf('}', src.indexOf(":root[data-theme='light']")));
  for (const token of ['--glow', '--dot']) {
    const d = dark.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1];
    const l = light.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1];
    assert.ok(d && l, `${token} must be defined for both themes`);
    assert.notEqual(d, l, `${token} should differ between themes`);
  }
});

test('no full-width divider lines between sections', () => {
  const section = css.match(/\.section\{([^}]*)\}/)[1];
  assert.doesNotMatch(section, /border/);
  assert.doesNotMatch(css, /\.stats\[[^\]]*\]\{[^}]*border-top|\.stats\{[^}]*border-top/);
  assert.doesNotMatch(css, /\.footer\[[^\]]*\]\{[^}]*border-top|\.footer\{[^}]*border-top/);
});

test('stats sit in a rounded card; footer divider fades at both ends', () => {
  assert.match(html, /<dl\b[^>]*class="[^"]*\bcard\b/);
  assert.match(css, /\.footer-inner[^{]*\{[^}]*border-image:linear-gradient\(90deg,transparent/);
});
