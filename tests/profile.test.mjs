import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profile, yearsOfExperience } from '../src/data/profile.ts';

test('identity and positioning', () => {
  assert.equal(profile.title, 'Senior Software Engineer');
  assert.equal(profile.title, profile.experience[0].role, 'site title matches current job title');
  assert.doesNotMatch(JSON.stringify(profile), /senior backend/i);
  assert.equal(profile.availability, 'Open to interesting work');
  assert.equal(
    profile.openToRoles,
    'Not actively looking, but always happy to hear about interesting freelance projects or roles.',
  );
  assert.equal(profile.headline.lead, 'Backend engineer who makes');
  assert.equal(profile.headline.accent, 'slow systems fast');
});

test('headline stats', () => {
  assert.deepEqual(profile.stats.map((s) => s.value), [`${yearsOfExperience}+`, '50k+', '7–8x', '~20%']);
  assert.deepEqual(profile.stats.map((s) => s.label), [
    'Years of experience',
    'Users served',
    'Faster database queries',
    'Company revenue from a module I owned',
  ]);
});

test('years of experience are computed from the first job (Aug 2019)', () => {
  const start = new Date(2019, 7, 1);
  const now = new Date();
  const expected = now.getFullYear() - start.getFullYear() - (now.getMonth() < start.getMonth() ? 1 : 0);
  assert.equal(yearsOfExperience, expected);
  assert.ok(profile.intro.startsWith(`${expected}+ years`));
  assert.ok(profile.seo.description.includes(`${expected}+ years`));
  assert.equal(profile.experience.at(-1).start, 'Aug 2019');
});

test('services are the three strengths', () => {
  assert.deepEqual(profile.services.map((s) => s.title), [
    'Backend & API development',
    'Performance rescue',
    'Upgrades & modernization',
  ]);
});

test('experience in reverse-chronological order', () => {
  assert.deepEqual(profile.experience.map((j) => j.company), [
    'Handelnine Global',
    'HowNow',
    'Velotio Technologies',
    'Happy Loans',
    'Drip Capital',
  ]);
  const [current, hownow, ...past] = profile.experience;
  assert.deepEqual(
    { role: current.role, start: current.start, end: current.end },
    { role: 'Senior Software Engineer', start: 'Oct 2026', end: 'Present' },
  );
  assert.deepEqual(current.highlights, ['Building and scaling backend systems for a global e-commerce business.']);
  assert.equal(hownow.start, 'Jan 2023');
  assert.equal(hownow.end, 'Oct 2026');
  assert.match(hownow.highlights[0], /^Owned /, 'past role written in past tense');
  for (const job of [hownow, ...past]) {
    assert.ok(job.highlights.length >= 2 && job.highlights.length <= 3, `${job.company} has ${job.highlights.length} highlights`);
  }
});

test('rotating headline phrases', () => {
  assert.equal(profile.headline.rotating[0], profile.headline.accent);
  assert.ok(profile.headline.rotating.length >= 4);
});

test('contact details and links', () => {
  assert.equal(profile.resumeUrl, '/jigar-panchal-resume.pdf');
  assert.equal(profile.email, 'panchaljigar82@gmail.com');
  const hrefs = profile.links.map((l) => l.href);
  assert.ok(hrefs.includes('https://www.linkedin.com/in/jigar-panchal-889610112'));
  assert.ok(hrefs.includes('https://github.com/jigar786'));
});


test('positioned as multi-language, not Rails-only', () => {
  assert.doesNotMatch(profile.seo.title, /rails/i);
  for (const lang of ['Ruby on Rails', 'Node.js', 'Python']) {
    assert.ok(profile.intro.includes(lang), `intro missing ${lang}`);
    assert.ok(profile.seo.description.includes(lang), `description missing ${lang}`);
  }
  assert.match(profile.services[0].body, /whatever/);
  assert.doesNotMatch(profile.services.map((s) => s.title).join(' '), /rails/i);
});

test('links match the clickable links embedded in the résumé PDF (when present locally)', async (t) => {
  const { readFileSync, existsSync } = await import('node:fs');
  const { inflateSync } = await import('node:zlib');
  const pdfPath = new URL('../public/jigar-panchal-resume.pdf', import.meta.url);
  if (!existsSync(pdfPath)) return t.skip('résumé PDF not present (it is not committed)');
  const raw = readFileSync(pdfPath);
  const chunks = [raw.toString('latin1')];
  for (const m of raw.toString('latin1').matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    try { chunks.push(inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1')); } catch {}
  }
  const uris = new Set(chunks.flatMap((c) => [...c.matchAll(/\/URI\s*\(([^)]*)\)/g)].map((m) => m[1])));
  for (const link of profile.links) assert.ok(uris.has(link.href), `${link.label} ${link.href} is not a link in the résumé`);
  assert.ok(uris.has(`mailto:${profile.email}`));
});
