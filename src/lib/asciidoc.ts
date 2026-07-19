import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { load as loadAdoc } from 'asciidoctor';
import type { Loader } from 'astro/loaders';

export interface SplitAdoc {
  frontMatter: Record<string, any>;
  body: string;
}

/** Split YAML front matter (Jekyll-style) from an AsciiDoc body. */
export function splitFrontMatter(raw: string): SplitAdoc {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { frontMatter: {}, body: raw };
  let frontMatter: Record<string, any> = {};
  try {
    frontMatter = (parseYaml(m[1]) ?? {}) as Record<string, any>;
  } catch {
    // malformed front matter — treat the file as body-only
    return { frontMatter: {}, body: raw };
  }
  return { frontMatter, body: raw.slice(m[0].length) };
}

function decodeEntities(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

/** Extract h2/h3 headings (id + text) from rendered HTML for on-page TOCs. */
export function extractToc(html: string): TocItem[] {
  const out: TocItem[] = [];
  for (const m of html.matchAll(/<h([23])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)) {
    out.push({ id: m[2], title: decodeEntities(m[3]), level: Number(m[1]) });
  }
  return out;
}

/** Render an AsciiDoc string to an HTML fragment (embedded mode, no page chrome). */
export async function renderAdoc(body: string, attributes: Record<string, string> = {}) {
  const doc = await loadAdoc(body, {
    safe: 'safe',
    attributes: {
      sectids: '',
      ...attributes,
    },
  });
  const docTitleRaw = (doc.getDocumentTitle?.() as string | undefined) ?? undefined;
  // Asciidoctor returns titles with inline markup/entities — flatten to text.
  const docTitle = docTitleRaw
    ?.replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
  const html = (await doc.convert()) as unknown as string;
  return { html, docTitle };
}

function walk(base: string): string[] {
  const out: string[] = [];
  if (!existsSync(base)) return out;
  for (const entry of readdirSync(base)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const abs = join(base, entry);
    if (statSync(abs).isDirectory()) out.push(...walk(abs));
    else if (entry.endsWith('.adoc')) out.push(abs);
  }
  return out;
}

export interface AdocLoaderOptions {
  /** Directory to scan for .adoc files (project-relative). */
  base: string;
  /** Asciidoctor attributes applied to every document. */
  attributes?: Record<string, string>;
  /** Filter by POSIX-style path relative to base (extension included). */
  include?: (rel: string) => boolean;
  /** Map a relative path to an entry id. Default: rel path minus extension. */
  idFromRel?: (rel: string) => string;
  /** Extra/override data per entry (merged after front matter). */
  dataFromEntry?: (entry: {
    id: string;
    rel: string;
    frontMatter: Record<string, any>;
    body: string;
    docTitle?: string;
    toc?: TocItem[];
  }) => Record<string, any>;
  /** Post-process rendered HTML per entry (e.g. link rewriting). */
  transformHtml?: (html: string, ctx: { id: string; rel: string }) => string;
}

/**
 * Astro content-layer loader that renders AsciiDoc files with Asciidoctor.js
 * and stores the HTML as `rendered.html`, so entries work with `render(entry)`
 * and `<Content />` exactly like Markdown entries.
 */
export function adocLoader(options: AdocLoaderOptions): Loader {
  const base = options.base;
  return {
    name: `adoc-loader:${base}`,
    async load({ store, parseData, logger }) {
      store.clear();
      if (!existsSync(base)) {
        logger.warn(
          `[adoc-loader] ${base} does not exist — collection will be empty. ` +
            'If this is a docs/man-pages collection, run `npm run fetch-sources` first (needs network).',
        );
        return;
      }
      for (const abs of walk(base)) {
        const rel = relative(base, abs).split(sep).join('/');
        if (options.include && !options.include(rel)) continue;
        const raw = readFileSync(abs, 'utf8');
        const { frontMatter, body } = splitFrontMatter(raw);
        let html: string;
        let docTitle: string | undefined;
        try {
          ({ html, docTitle } = await renderAdoc(body, options.attributes));
        } catch (err) {
          logger.error(`[adoc-loader] failed to render ${rel}: ${(err as Error).message}`);
          continue;
        }
        const id = options.idFromRel ? options.idFromRel(rel) : rel.replace(/\.adoc$/, '');
        if (options.transformHtml) html = options.transformHtml(html, { id, rel });
        const extra = options.dataFromEntry
          ? options.dataFromEntry({ id, rel, frontMatter, body, docTitle, toc: extractToc(html) })
          : {};
        const data = await parseData({
          id,
          data: { ...frontMatter, ...extra },
          filePath: abs,
        });
        store.set({ id, data, rendered: { html }, filePath: abs });
      }
    },
  };
}
