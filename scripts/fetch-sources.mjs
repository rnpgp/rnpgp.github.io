#!/usr/bin/env node
/**
 * Pulls software documentation sources into vendor/<product>/ at build time.
 *
 * For each src/content/software/<name>.md with `docs_repo:` front matter we
 * sparse-clone the repository (blob-less, depth 1) and check out only:
 *   - README* (docs landing page)
 *   - the `docs_subtree` directory (default: docs/)
 *   - product-specific EXTRA_PATHS below (e.g. RNP man pages)
 *
 * `docs_ref` (tag/branch) pins the checkout; omit for the default branch.
 * Existing vendor clones are reused (delete vendor/ to force a refresh).
 * Network failures are warnings, not errors — docs pages degrade gracefully.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, 'vendor');
const softwareDir = join(root, 'src/content/software');

/** Extra files to check out per product, gitignore-style sparse patterns. */
const EXTRA_PATHS = {
  rnp: ['/src/rnp/rnp.1.adoc', '/src/rnpkeys/rnpkeys.1.adoc', '/src/lib/librnp.3.adoc'],
};

function frontMatter(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? (parseYaml(m[1]) ?? {}) : {};
}

function run(args, cwd) {
  execFileSync('git', args, { cwd, stdio: 'pipe' });
}

let failures = 0;

for (const file of readdirSync(softwareDir).filter((f) => f.endsWith('.md'))) {
  const fm = frontMatter(join(softwareDir, file));
  if (!fm.docs_repo) continue;

  const name = file.replace(/\.md$/, '');
  const dest = join(vendorDir, name);
  if (existsSync(dest)) {
    console.log(`[fetch-sources] ${name}: vendor clone exists, skipping`);
    continue;
  }

  const subtree = fm.docs_subtree ?? 'docs';
  const paths = ['/README*', `/${subtree}/`, ...(EXTRA_PATHS[name] ?? [])];
  const refArgs = fm.docs_ref ? ['--branch', String(fm.docs_ref)] : [];

  try {
    mkdirSync(vendorDir, { recursive: true });
    console.log(
      `[fetch-sources] ${name}: cloning ${fm.docs_repo}${fm.docs_ref ? `@${fm.docs_ref}` : ''} …`,
    );
    run(
      ['clone', '--depth', '1', '--filter=blob:none', '--sparse', ...refArgs, fm.docs_repo, dest],
      root,
    );
    run(['sparse-checkout', 'set', '--no-cone', ...paths], dest);
    console.log(`[fetch-sources] ${name}: done`);
  } catch (err) {
    failures += 1;
    console.warn(`[fetch-sources] WARNING: could not fetch ${fm.docs_repo} — ${err.message}`);
    console.warn('[fetch-sources] continuing; docs/man pages will be missing from this build');
  }
}

if (failures > 0) {
  console.warn(`[fetch-sources] completed with ${failures} warning(s)`);
}
