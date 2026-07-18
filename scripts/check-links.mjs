#!/usr/bin/env node
/**
 * Internal link checker: crawls every HTML file in dist/, extracts href/src
 * values, and verifies every root-relative target exists in dist/. External links
 * and fragment-only links are skipped. Exit code 1 on any broken link.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const dist = new URL('../dist', import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const abs = join(dir, e);
    if (statSync(abs).isDirectory()) out.push(...walk(abs));
    else if (e.endsWith('.html')) out.push(abs);
  }
  return out;
}

const SKIP_PREFIX = ['http://', 'https://', 'mailto:', 'tel:', 'data:', 'javascript:'];
const broken = new Map();

for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (SKIP_PREFIX.some((p) => ref.startsWith(p)) || ref.startsWith('#') || !ref.startsWith('/'))
      continue;
    const path = ref.split('#')[0].split('?')[0];
    if (!path || path === '/') continue;
    // pagefind assets are generated post-build; they exist in dist too
    const asFile = join(dist, path);
    const asDirIndex = join(dist, path, 'index.html');
    const withSlash = join(dist, path.replace(/\/?$/, '/'), 'index.html');
    if (!existsSync(asFile) && !existsSync(asDirIndex) && !existsSync(withSlash)) {
      const rel = file.slice(dist.length);
      if (!broken.has(ref)) broken.set(ref, []);
      broken.get(ref).push(rel);
    }
  }
}

if (broken.size) {
  console.error(`BROKEN: ${broken.size} broken internal reference(s):`);
  for (const [ref, files] of broken) {
    console.error(`  ${ref}  ← referenced from ${files.length} page(s), e.g. ${files[0]}`);
  }
  process.exit(1);
}
console.log('OK — all internal href/src targets exist in dist/.');
