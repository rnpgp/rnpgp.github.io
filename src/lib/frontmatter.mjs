/**
 * YAML front-matter parser shared between the Astro layer (.ts) and the
 * standalone Node scripts (.mjs). Kept in .mjs so fetch-sources.mjs can
 * import it without a TS compiler.
 */
import { parse as parseYaml } from 'yaml';

/**
 * Split YAML front matter (Jekyll-style `---\n...\n---`) from a raw text body.
 * Returns `{ frontMatter, body }`; if no front matter is present the whole
 * input is returned as `body` and `frontMatter` is `{}`.
 */
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { frontMatter: {}, body: raw };
  try {
    return { frontMatter: parseYaml(m[1]) ?? {}, body: raw.slice(m[0].length) };
  } catch {
    return { frontMatter: {}, body: raw };
  }
}
