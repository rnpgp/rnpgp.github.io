import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { adocLoader } from './lib/asciidoc';

/**
 * Version of the RNP release whose man pages are rendered at /docs/.
 * Bump together with `docs_ref` in src/content/software/rnp.md.
 */
const RNP_VERSION = '0.18.1';

const categories = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (v == null ? [] : typeof v === 'string' ? [v] : v));

const externalLinks = z
  .array(z.object({ url: z.string(), title: z.string().default('Link') }))
  .default([]);

const blog = defineCollection({
  loader: adocLoader({
    base: './src/content/blog',
    dataFromEntry: ({ id, frontMatter }) => {
      // Permalink date is authoritative (matches the URL slug).
      const m = id.match(/^(\d{4})-(\d{2})-(\d{2})-/);
      return {
        ...frontMatter,
        date: m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : frontMatter.date,
      };
    },
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories,
    authors: z
      .array(
        z.object({
          name: z.string(),
          email: z.string().optional(),
          social_links: z.array(z.string()).optional(),
        }),
      )
      .default([]),
    excerpt: z.string().optional(),
    redirect_from: z.array(z.string()).default([]),
  }),
});

const advisories = defineCollection({
  loader: adocLoader({ base: './src/content/advisories' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    id: z.string().optional(),
    cve_id: z.string().optional(),
    categories,
    excerpt: z.string().optional(),
  }),
});

const software = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/software' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repo_url: z.string(),
    tags: z.array(z.string()).default([]),
    external_links: externalLinks,
    docs_repo: z.string().optional(),
    docs_subtree: z.string().default('docs'),
    docs_ref: z.string().optional(),
    feature_with_priority: z.number().optional(),
  }),
});

const specs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/specs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    feature_with_priority: z.number().optional(),
    external_links: externalLinks,
    tags: z.array(z.string()).default([]),
  }),
});

/**
 * Upstream content (vendor READMEs/docs) links that are broken or moved; fixed
 * at render time so we don't fork the upstream docs. Covers href and src.
 */
const UPSTREAM_LINK_FIXES: [string, string][] = [
  [
    'https://www.ietf.org/id/draft-ietf-openpgp-rfc4880bis-09.txt',
    'https://web.archive.org/web/20200819150402/https://www.ietf.org/id/draft-ietf-openpgp-rfc4880bis-09.txt',
  ],
  [
    'https://github.com/rnpgp/ruby-rnp/actions/workflows/tests.yml',
    'https://github.com/rnpgp/ruby-rnp/actions/workflows/test-and-release.yml',
  ],
  [
    'https://www.rubydoc.info/github/rnpgp/ruby-rnp/master/',
    'https://www.rubydoc.info/github/rnpgp/ruby-rnp',
  ],
];

/**
 * Software documentation pulled from each product's repository at build time
 * (scripts/fetch-sources.mjs → vendor/<product>/). The repo-root README.adoc
 * becomes the docs landing page (…/docs/README/), matching the legacy URLs.
 */
const softwareDocs = defineCollection({
  loader: adocLoader({
    base: './vendor',
    // signing-keys.adoc is excluded: signing keys live on our own /openpgp-keys/ page.
    include: (rel) =>
      /^[^/]+\/(README\.adoc|docs\/.+\.adoc)$/.test(rel) &&
      !rel.endsWith('docs/signing-keys.adoc'),
    idFromRel: (rel) => {
      const parts = rel.split('/');
      const product = parts[0];
      if (parts[1] === 'README.adoc') return `${product}/README`;
      return `${product}/${parts.slice(1).join('/').replace(/^docs\//, '').replace(/\.adoc$/, '')}`;
    },
    dataFromEntry: ({ id, frontMatter, docTitle }) => ({
      ...frontMatter,
      title: frontMatter.title ?? docTitle ?? id.split('/').pop() ?? id,
      product: id.split('/')[0],
    }),
    transformHtml: (html, { id }) => {
      const product = id.split('/')[0];
      // Relative links between upstream .adoc files (e.g. href="docs/cli-usage.adoc"
      // in the RNP README) point at on-site doc pages instead of repo paths.
      let out = html.replace(
        /href="(?!https?:|mailto:|#|\/)(?:\.\/)?(?:docs\/)?([^"#]+?)\.adoc(#[^"]*)?"/g,
        (_m, p, frag) => `href="/software/${product}/docs/${p}/${frag ?? ''}"`,
      );
      for (const [from, to] of UPSTREAM_LINK_FIXES) out = out.split(from).join(to);
      return out;
    },
  }),
  schema: z.object({
    title: z.string(),
    product: z.string(),
  }),
});

/**
 * Man pages (rnp.1, rnpkeys.1, librnp.3) rendered from the pinned RNP release
 * checkout in vendor/rnp (see fetch-sources.mjs).
 */
const manpages = defineCollection({
  loader: adocLoader({
    base: './vendor/rnp/src',
    include: (rel) =>
      ['rnp/rnp.1.adoc', 'rnpkeys/rnpkeys.1.adoc', 'lib/librnp.3.adoc'].includes(rel),
    attributes: {
      'component-version': RNP_VERSION,
      'release-version': RNP_VERSION,
    },
    idFromRel: (rel) => {
      const file = rel.split('/').pop()!.replace(/\.adoc$/, ''); // rnp.1 | rnpkeys.1 | librnp.3
      return file.replace(/\./g, '-'); // rnp-1 | rnpkeys-1 | librnp-3
    },
    dataFromEntry: ({ id, body, docTitle }) => {
      const nameSection = body.match(/==\s*NAME\s*\r?\n\r?\n([^\n]+)/);
      const desc = nameSection?.[1]?.split(' - ')[1]?.replace(/[.\s]+$/, '') ?? '';
      return {
        title: docTitle ?? id,
        description: desc,
        section: id.endsWith('-3') ? 3 : 1,
        version: RNP_VERSION,
      };
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    section: z.number(),
    version: z.string(),
  }),
});

export const collections = { blog, advisories, software, specs, softwareDocs, manpages };
