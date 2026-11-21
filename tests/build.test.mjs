import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distExists, readDist, readDistBytes } from './helpers.mjs';

test('builds an HTML homepage', () => {
  assert.ok(distExists('index.html'), 'dist/index.html missing');
  assert.match(readDist('index.html'), /<!doctype html>/i);
});

test('publishes the résumé PDF', () => {
  assert.ok(distExists('jigar-panchal-resume.pdf'));
});

test('generates a sitemap', () => {
  assert.ok(distExists('sitemap-index.xml'));
});

test('social preview image is a small PNG', () => {
  assert.ok(distExists('og.png'), 'dist/og.png missing');
  const bytes = readDistBytes('og.png');
  assert.deepEqual([...bytes.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  assert.ok(bytes.length < 200 * 1024, `${bytes.length} bytes`);
});
