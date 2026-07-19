#!/usr/bin/env node
/**
 * Makes search work in `astro dev`: the Pagefind index is generated from the
 * production build (postbuild → dist/pagefind), which the dev server doesn't
 * serve. This copies the latest built index into public/pagefind (gitignored)
 * so the dev server can serve it. Run after a build; predev runs it for you.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'dist', 'pagefind');
const dest = join(root, 'public', 'pagefind');

if (!existsSync(join(src, 'pagefind.js'))) {
  console.warn(
    '[prepare-dev-search] no build index found at dist/pagefind — ' +
      'run `npm run build` once; search will be unavailable in dev until then.',
  );
  process.exit(0);
}

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log('[prepare-dev-search] copied dist/pagefind → public/pagefind (dev search ready)');
