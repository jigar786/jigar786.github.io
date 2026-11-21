import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, tags, attr, metaContent, scripts } from './helpers.mjs';
import { profile } from '../src/data/profile.ts';

const html = readDist('index.html');
const SITE = 'https://jigar786.github.io';

test('document language and title', () => {
  assert.match(html, /<html[^>]*\slang="en"/);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  assert.equal(title?.replaceAll('&amp;', '&'), profile.seo.title);
  assert.equal(metaContent(html, 'description'), profile.seo.description);
});

test('canonical and social meta', () => {
  const canonical = tags(html, 'link').find((t) => attr(t, 'rel') === 'canonical');
  assert.equal(canonical && attr(canonical, 'href'), `${SITE}/`);
  assert.equal(metaContent(html, 'og:title'), profile.seo.title);
  assert.equal(metaContent(html, 'og:description'), profile.seo.description);
  assert.equal(metaContent(html, 'og:image'), `${SITE}/og.png`);
  assert.equal(metaContent(html, 'twitter:card'), 'summary_large_image');
});

test('JSON-LD Person schema', () => {
  const ld = scripts(html).find((s) => attr(s.open, 'type') === 'application/ld+json');
  assert.ok(ld, 'no JSON-LD script');
  const data = JSON.parse(ld.body);
  assert.equal(data['@type'], 'Person');
  assert.equal(data.jobTitle, profile.title);
  assert.ok(data.sameAs.includes('https://www.linkedin.com/in/jigar-panchal-889610112'));
  assert.ok(data.sameAs.includes('https://github.com/jigar786'));
});

test('no external scripts, stylesheets or web fonts', () => {
  assert.ok(!scripts(html).some((s) => attr(s.open, 'src') !== undefined), 'external <script src> found');
  assert.ok(!tags(html, 'link').some((t) => attr(t, 'rel') === 'stylesheet'), 'external stylesheet found');
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)/);
});

test('exactly one inline script, and its storage access is guarded', () => {
  const inline = scripts(html).filter((s) => attr(s.open, 'type') !== 'application/ld+json');
  assert.equal(inline.length, 1);
  assert.match(inline[0].body, /localStorage/);
  assert.match(inline[0].body, /try\s*\{/);
});

test('theme toggle is hidden until JS runs', () => {
  const toggle = tags(html, 'button').find((t) => attr(t, 'id') === 'theme-toggle');
  assert.ok(toggle, 'no #theme-toggle button');
  assert.notEqual(attr(toggle, 'hidden'), undefined, 'toggle should render with hidden attribute');
});

test('skip link and main landmark', () => {
  assert.ok(tags(html, 'a').some((t) => attr(t, 'href') === '#main'));
  assert.ok(tags(html, 'main').some((t) => attr(t, 'id') === 'main'));
});

test('robots.txt points at the sitemap', () => {
  assert.match(readDist('robots.txt'), new RegExp(`Sitemap: ${SITE}/sitemap-index.xml`));
});

test('favicon is published and linked', () => {
  assert.ok(readDist('favicon.svg').includes('<svg'));
  assert.ok(tags(html, 'link').some((t) => attr(t, 'rel') === 'icon' && attr(t, 'href') === '/favicon.svg'));
});

test('in-page links scroll without adding #section to the address bar', () => {
  const inline = scripts(html).filter((s) => attr(s.open, 'type') !== 'application/ld+json')[0].body;
  assert.match(inline, /a\[href\^="#"\]/, 'handles in-page links');
  assert.match(inline, /preventDefault\(\)/);
  assert.match(inline, /glideTo\(target\)/);
  assert.match(inline, /\.focus\(\{\s*preventScroll:\s*true\s*\}\)/, 'moves keyboard focus to the section');
  assert.doesNotMatch(inline, /pushState|location\.hash\s*=/, 'must not write the hash');
});

test('in-page scrolling is a custom eased glide (not the abrupt native jump)', () => {
  const inline = scripts(html).filter((s) => attr(s.open, 'type') !== 'application/ld+json')[0].body;
  assert.match(inline, /requestAnimationFrame\(/);
  assert.match(inline, /function\s+ease\w*\(/, 'uses an easing curve');
  assert.match(inline, /addEventListener\('wheel'/, 'user scrolling cancels the glide');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('').replace(/\s+/g, '');
  assert.doesNotMatch(css, /scroll-behavior:smooth/, 'CSS smooth scrolling would fight the JS glide');
});
