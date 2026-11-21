import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Stored reversed so the number itself never appears in the repo.
const PHONE = '1030220299'.split('').reverse().join('');
const BINARY = /\.(pdf|png|jpe?g|gif|ico|woff2?)$/i;

test('phone number is not committed in any text file, in any formatting', () => {
  const root = new URL('..', import.meta.url);
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && !BINARY.test(f) && f !== 'package-lock.json');
  const hits = files.filter((f) =>
    readFileSync(new URL(f, root), 'utf8')
      .split('\n')
      .some((line) => line.replace(/\D/g, '').includes(PHONE)),
  );
  assert.deepEqual(hits, []);
});

test('résumé PDF (contains the phone number) is never committed', () => {
  const root = new URL('..', import.meta.url);
  const tracked = execFileSync('git', ['ls-files', '--cached', '*.pdf'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(tracked, '', `tracked PDFs: ${tracked}`);
  assert.match(readFileSync(new URL('.gitignore', root), 'utf8'), /^public\/jigar-panchal-resume\.pdf$/m);
});

test('deploy fetches the résumé from the "resume" release before building', () => {
  const wf = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  const download = wf.indexOf('gh release download resume');
  const build = wf.indexOf('uses: withastro/action');
  assert.ok(download > -1, 'no release download step');
  assert.ok(download < build, 'download must run before the Astro build');
  assert.match(wf, /--dir public/);
  assert.match(wf, /GH_TOKEN: \$\{\{ github\.token \}\}/);
});
