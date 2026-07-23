/**
 * Vendor-source conventions shared between content.config.ts and
 * scripts/fetch-sources.mjs. Kept in .mjs so the standalone fetch script can
 * import it without a TS compiler.
 */
import { readFileSync } from 'node:fs';
import { parseFrontmatter } from './frontmatter.mjs';

/** Project-relative directory sparse-cloned by fetch-sources.mjs. */
export const VENDOR_DIR = 'vendor';

/**
 * Man-page sources for the RNP product, relative to `vendor/rnp/src/`.
 * Sparse-checkout patterns are derived from this list.
 */
export const RNP_MAN_PAGES = ['rnp/rnp.1.adoc', 'rnpkeys/rnpkeys.1.adoc', 'lib/librnp.3.adoc'];

/** Sparse-checkout patterns (repo-root relative) for RNP's extra paths. */
export const RNP_EXTRA_SPARSE = RNP_MAN_PAGES.map((p) => `/src/${p}`);

/**
 * Pinned RNP release tag, read from `docs_ref` in `src/content/software/rnp.md`.
 * `RNP_VERSION` (without the leading `v`) is derived from the tag so the two
 * can no longer drift apart.
 */
const rnpFrontMatter = parseFrontmatter(
  readFileSync('src/content/software/rnp.md', 'utf8'),
).frontMatter;

export const RNP_RELEASE_TAG = String(rnpFrontMatter.docs_ref ?? '').trim();
export const RNP_VERSION = RNP_RELEASE_TAG.replace(/^v/, '');
