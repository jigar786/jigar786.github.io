import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const distPath = (path) => fileURLToPath(new URL(`../dist/${path}`, import.meta.url));
export const distExists = (path) => existsSync(distPath(path));
export const readDist = (path) => readFileSync(distPath(path), 'utf8');
export const readDistBytes = (path) => readFileSync(distPath(path));

// Tiny HTML helpers (no dependencies): find tags and read attributes.
export const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
export const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}(?:=(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?(?=[\\s/>])`, 'i'));
  if (!m) return undefined;
  return m[1] ?? m[2] ?? m[3] ?? '';
};
export const metaContent = (html, key) => {
  const tag = tags(html, 'meta').find((t) => attr(t, 'name') === key || attr(t, 'property') === key);
  return tag && attr(tag, 'content');
};
export const scripts = (html) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((m) => ({ open: `<script${m[1]}>`, body: m[2] }));
