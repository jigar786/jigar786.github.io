import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, tags, attr } from './helpers.mjs';
import { profile, yearsOfExperience } from '../src/data/profile.ts';

const html = readDist('index.html');
// Decode the few entities Astro emits so content can be compared to profile strings.
const text = html
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ open: `<a${m[1]}>`, inner: m[2] }));

test('renders every piece of profile content', () => {
  const expected = [
    profile.availability,
    profile.headline.accent,
    profile.openToRoles,
    ...profile.stats.map((s) => s.value),
    ...profile.services.map((s) => s.title),
    ...profile.experience.map((j) => j.company),
    ...profile.projects.map((p) => p.name),
    ...profile.achievements,
    ...profile.education.map((e) => e.school),
  ];
  for (const s of expected) assert.ok(text.includes(s), `missing: ${s}`);
});

test('logo is the plain name with an accent dot', () => {
  const logo = anchors.find((a) => attr(a.open, 'href') === '#top' && /logo/.test(attr(a.open, 'class') ?? ''));
  assert.ok(logo, 'no logo link to #top');
  assert.equal(logo.inner.replace(/<[^>]+>/g, '').trim(), 'Jigar Panchal.');
  assert.doesNotMatch(text, /~\/jigar-panchal/);
});

test('section titles are plain and classic', () => {
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim());
  assert.deepEqual(h2s, ['Experience', 'What I Do', 'Projects', 'Skills', 'Awards', 'Education', 'Contact']);
  assert.doesNotMatch(text, /\/\/ (experience|how I can help|projects|skills|recognition|education|contact)/i);
});

test('primary and résumé calls to action', () => {
  assert.ok(anchors.some((a) => attr(a.open, 'href') === '#contact' && /Get in touch/.test(a.inner)), 'Get in touch → #contact');
  assert.ok(
    anchors.some((a) => attr(a.open, 'href') === profile.resumeUrl && attr(a.open, 'download') !== undefined),
    'résumé download link',
  );
});

test('tone: no hard-sell wording', () => {
  assert.doesNotMatch(text, /hire me|start a project/i);
});

test('experience comes before "How I can help"', () => {
  const exp = html.indexOf('id="experience"');
  const help = html.indexOf('id="help"');
  assert.ok(exp > -1 && help > -1, 'both sections present');
  assert.ok(exp < help);
});

test('contact links', () => {
  assert.ok(anchors.some((a) => attr(a.open, 'href') === `mailto:${profile.email}`));
  for (const link of profile.links) {
    const a = anchors.find((x) => attr(x.open, 'href') === link.href);
    assert.ok(a, `missing link ${link.href}`);
    assert.match(attr(a.open, 'rel') ?? '', /noopener/);
  }
});

test('every in-page anchor has a target', () => {
  const ids = new Set(tags(html, '[a-z0-9]+').map((t) => attr(t, 'id')).filter(Boolean));
  for (const a of anchors) {
    const href = attr(a.open, 'href');
    if (href?.startsWith('#') && href.length > 1) assert.ok(ids.has(href.slice(1)), `no target for ${href}`);
  }
});

test('exactly one h1', () => {
  assert.equal(tags(html, 'h1').length, 1);
});

test('responsive CSS is in place', () => {
  const compact = css.replace(/\s+/g, '');
  assert.match(compact, /scroll-margin-top/);
  assert.match(compact, /clamp\(/);
  // Astro's minifier may emit range syntax: (width>=720px)
  assert.match(compact, /@media\((min-width:|width>=)720px\)/);
  assert.ok(
    tags(html, 'meta').some((t) => attr(t, 'name') === 'viewport' && attr(t, 'content') === 'width=device-width, initial-scale=1'),
  );
});

test('mobile menu is a <details> with the section links', () => {
  const m = html.match(/<details\b[^>]*data-menu[^>]*>([\s\S]*?)<\/details>/i);
  assert.ok(m, 'no <details data-menu>');
  assert.match(m[1], /<summary\b/);
  for (const id of ['experience', 'projects', 'contact']) assert.match(m[1], new RegExp(`href="#${id}"`));
});

test('homepage stays under 50 KB', () => {
  assert.ok(Buffer.byteLength(html) < 50 * 1024, `${Buffer.byteLength(html)} bytes`);
});

test('accessible names contain the visible label (voice control)', () => {
  const labelled = [...html.matchAll(/<(a|summary|button)\b([^>]*\saria-label="([^"]*)"[^>]*)>([\s\S]*?)<\/\1>/gi)];
  for (const [, , , label, inner] of labelled) {
    const visible = inner.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<[^>]+>/g, '').trim();
    if (visible) assert.ok(label.toLowerCase().includes(visible.toLowerCase()), `"${label}" vs visible "${visible}"`);
  }
});

test('contact uses labelled icon buttons, not the raw email address', () => {
  const contact = html.slice(html.indexOf('id="contact"'), html.indexOf('</section>', html.indexOf('id="contact"')));
  const links = [...contact.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ open: `<a${m[1]}>`, inner: m[2] }));
  const expected = [
    ['Email', `mailto:${profile.email}`],
    ['LinkedIn', 'https://www.linkedin.com/in/jigar-panchal-889610112'],
    ['GitHub', 'https://github.com/jigar786'],
  ];
  for (const [label, href] of expected) {
    const a = links.find((l) => attr(l.open, 'href') === href);
    assert.ok(a, `no contact link to ${href}`);
    assert.equal(attr(a.open, 'aria-label'), label);
    assert.equal(attr(a.open, 'title'), label, 'tooltip');
    assert.match(a.inner, /<svg\b[^>]*aria-hidden="true"/, `${label} needs an icon`);
    assert.equal(a.inner.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim(), '', `${label} should be icon-only`);
  }
  assert.ok(!contact.replace(/href="[^"]*"/g, '').includes(profile.email), 'email address should not be printed in Contact');
});

test('exactly one résumé download on the page', () => {
  assert.equal(anchors.filter((a) => attr(a.open, 'href') === profile.resumeUrl).length, 1);
});

test('footer is just the copyright line', () => {
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  assert.equal(footer, `© ${new Date().getFullYear()} ${profile.name}`);
});

test('external profile links send a referrer (LinkedIn shows its sign-in wall to referrer-less visits)', () => {
  for (const link of profile.links) {
    const a = anchors.find((x) => attr(x.open, 'href') === link.href);
    assert.doesNotMatch(attr(a.open, 'rel') ?? '', /noreferrer/, `${link.label} should not use noreferrer`);
  }
});
