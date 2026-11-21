import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

// Token blocks: the first :root block is dark; [data-theme='light'] is light.
const block = (selector) => {
  const start = css.indexOf(selector);
  return css.slice(start, css.indexOf('}', start));
};
const tokens = (src) => Object.fromEntries([...src.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const [name, sel] of [['dark', ':root {'], ['light', ":root[data-theme='light']"]]) {
  test(`${name} theme text colors meet WCAG AA (4.5:1) on every surface`, () => {
    const t = tokens(block(sel));
    for (const fg of ['text', 'muted', 'subtle', 'accent']) {
      for (const bg of ['bg', 'surface', 'surface-2']) {
        const r = ratio(t[fg], t[bg]);
        assert.ok(r >= 4.5, `${name}: --${fg} ${t[fg]} on --${bg} ${t[bg]} = ${r.toFixed(2)}`);
      }
    }
    assert.ok(ratio(t['pill-text'], t['pill-bg']) >= 4.5, `${name}: pill text`);
    assert.ok(ratio(t['btn-text'], t['btn-bg']) >= 4.5, `${name}: button text`);
  });
}
