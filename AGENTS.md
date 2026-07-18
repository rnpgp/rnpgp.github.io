# AGENTS.md

Guidance for AI coding agents working on this repository.

## Project overview

This is the source of the RNP project website, <https://www.rnpgp.org> — a
static site built with **Astro 7** (Node ≥ 22.12 required), styled with
**Tailwind CSS 4** (via `@tailwindcss/vite`, Vite 8 / Rolldown) and made
interactive with **Vue 3** islands (`@astrojs/vue`). RNP itself (the C++
OpenPGP/LibrePGP library) lives in a separate repository
([rnpgp/rnp](https://github.com/rnpgp/rnp)); this repository contains only the
website.

- Content is **AsciiDoc** (blog posts, advisories — rendered at build time by
  Asciidoctor.js via a custom content loader) and **Markdown** (software,
  specs). Write new content in English.
- Design system: "The Cryptographer's Paper" — IBM Plex (Plex Sans for
  text/display, Plex Mono for code/fingerprints/labels, self-hosted in
  `public/fonts/`), light-first pastel look with full dark mode, brand colors
  blue `#1A7BEC` / teal `#00DFB7` / gold `#FFDC4A` / navy `#14172B`, and the
  blue→teal brand gradient hero.
- Deployed to GitHub Pages by GitHub Actions (see "CI" below).

## Repository layout

- `astro.config.mjs` — Astro config (site URL, vue, sitemap, Tailwind Vite
  plugin, Shiki dual themes).
- `src/content.config.ts` — content collections: `blog`, `advisories`
  (AsciiDoc via custom loader), `software`, `specs` (Markdown glob loaders),
  `softwareDocs`, `manpages` (AsciiDoc over `vendor/`). Also defines
  `RNP_VERSION` for man pages.
- `src/lib/asciidoc.ts` — Asciidoctor.js wrapper + the custom content-layer
  loader (`adocLoader`) that renders `.adoc` → HTML and stores it as
  `rendered.html`, so entries work with `render(entry)` / `<Content />`.
- `src/lib/github.ts` — build-time "latest release" fetch with pinned fallback.
- `src/lib/tags.ts` — namespaced tag labels (`writtenin:C++` → "Written in C++").
- `src/content/blog/*.adoc` — blog posts, one `YYYY-MM-DD-slug.adoc` per post.
  URL: `/blog/<id>/` (id = filename). Front matter: `title`, `date`,
  `categories`, `authors` (`name`/`email`/`social_links`), `excerpt`,
  optional `redirect_from` (legacy `/blog/DD-MM-YYYY/.../` URLs are emitted as
  redirect pages).
- `src/content/advisories/*.adoc` — security advisories. Front matter:
  `title`, `date`, `id` (e.g. `RI-2021-01`), `cve_id`, `excerpt`. Advisories
  are dual-published with open.ribose.com (check there for new ones). CVE
  JSON 5.0 records are self-hosted in `public/cves/` and linked from the
  advisory pages — when adding an advisory, add its JSON record too.
- `src/content/software/*.md` — product pages. Front matter: `title`,
  `description`, `repo_url`, `tags`, `external_links` (`{url, title}`),
  optional `docs_repo`/`docs_subtree`/`docs_ref` (enables on-site docs),
  optional `feature_with_priority` (home-page featuring).
- `src/content/specs/*.md` — IETF draft specs (full text in a fenced block).
- `src/pages/` — routes, incl. `rss.xml.ts`, `robots.txt.ts`, `404.astro`.
- `src/layouts/` — `BaseLayout.astro` (shell: header, footer, SEO/OG, theme
  script, ClientRouter), `DocsLayout.astro` (product docs with sidebar).
- `src/components/` — Astro components; `src/components/vue/` — hydrated Vue
  islands (`SiteHeader`, `SiteSearch`, `HeroDecrypt`,
  `FingerprintPlayground`, `InstallTabs`, `BlogBrowser`,
  `KeyFingerprintCards`, `ThemeToggle`, `Reveal`, `CopyButton`).
- `src/styles/global.css` — Tailwind import, `@theme` tokens, semantic
  light/dark CSS variables, prose/asciidoctor skin, Shiki dual-theme CSS.
- `public/` — fonts, brand SVGs, `openpgp_keys/*.asc`, favicons, `og.png`.
- `scripts/fetch-sources.mjs` — sparse-clones software repos into `vendor/`.
- `vendor/` — pulled-in repos (gitignored; delete to force a refresh).

## Pulled-in content (do not commit)

`fetch-sources.mjs` (auto-run by `predev`/`prebuild`) sparse-clones each
software entry's `docs_repo` into `vendor/<name>/` (blob-less, depth 1, pinned
to `docs_ref` when set) and checks out only `README*`, the `docs_subtree`
directory, and — for rnp — the man-page sources
(`src/rnp/rnp.1.adoc`, `src/rnpkeys/rnpkeys.1.adoc`, `src/lib/librnp.3.adoc`).
The `softwareDocs` and `manpages` collections render from `vendor/`; if it is
missing (e.g. offline), those collections are empty and the build continues
with a warning. Existing clones are reused — `rm -rf vendor` to refresh.

**To update man pages / embedded docs after a new RNP release:** bump
`docs_ref` in `src/content/software/rnp.md`, `RNP_VERSION` in
`src/content.config.ts`, the fallback in `src/lib/github.ts`, then
`rm -rf vendor/rnp && npm run build`.

## Build and test commands

- `npm install` — install dependencies.
- `npm run dev` — dev server (runs fetch-sources first).
- `npm run build` — production build to `dist/` (fetch-sources + Pagefind).
- `npm run preview` — serve the production build locally.
- `npm run fetch-sources` — refresh `vendor/` manually.
- `npm run check:links` — verify every internal href/src in `dist/` exists.
- `npm run check:links:external` — full lychee check (internal + external) per
  `lychee.toml` (accept 429; excludes our own production URLs and bot-blocked
  sites). Must pass before merging; CI runs the same check.
- `npm run test:e2e` — interactive end-to-end checks (drives headless Chrome
  via CDP against a running preview on :4325; macOS Chrome required).

There is no unit test suite; validation is building + link checking.

## Conventions

- **Styling**: use the semantic Tailwind utilities (they auto-adapt to dark
  mode): `bg-background`, `bg-surface`, `bg-surface-dim`, `text-foreground`,
  `text-muted`, `text-faint`, `border-line`, `text-accent`, `text-accent2`.
  Do **not** write `dark:` variants for them. Custom classes from global.css:
  `.mono-label`, `.card`, `.card-hover`, `.gradient-rule`, `.graph-bg`,
  `.btn`, `.btn-primary`, `.btn-ghost`, `.fingerprint`.
- **Imports**: use the `@/` alias (`@/components/...`, `@/layouts/...`).
- **Islands**: interactivity goes in Vue SFCs under `src/components/vue/`,
  hydrated with `client:visible` (below the fold) or `client:load`; props must
  be JSON-serializable. Respect `prefers-reduced-motion` — headless Chrome
  forces it, so test checks must accept both paths.
- **WAAPI easter eggs** (keep them working, don't spoil them in visible copy):
  header logo on the home page — hover wobble, click pulse, every 3rd click is
  the "ribosome shuffle" (lenses split and snap back); typing `rnp` or `pgp`
  summons a brand-colored hex rain; typing `decrypt` replays the hero
  scramble; the hero watermark rotates on scroll via `ScrollTimeline`. All are
  covered by `scripts/e2e-cdp.mjs` (26 checks).
- **Search**: Pagefind index is generated post-build (`pagefind --site dist`);
  the `SiteSearch` island loads `/pagefind/pagefind.js` at runtime (absent in
  plain `astro dev`).
- **Dead links**: when an external link dies, point it at a Wayback Machine
  snapshot (`https://archive.org/wayback/available?url=<url>&timestamp=<yyyymmdd>`
  finds the closest capture) instead of a substitute page — the snapshot
  preserves exactly what the content referenced. Upstream/vendor links are
  fixed via `UPSTREAM_LINK_FIXES` in `src/content.config.ts`.
- **Astro 7 notes**: `src/content.config.ts` (not `src/content/config.ts`);
  `z` from `astro/zod`; `entry.id` + `render(entry)` (no `slug`/
  `entry.render()`); Asciidoctor.js 4.x is async (`await load()`,
  `await doc.convert()`); whitespace between adjacent inline elements in
  `.astro` collapses JSX-style — use `{' '}`.

## CI

- `.github/workflows/build_deploy.yml` — Node 22, `npm ci`, `fetch-sources`,
  build, deploy `dist/` to GitHub Pages (deploy only from `main`).
- `.github/workflows/links.yml` — builds the site and runs lychee over
  `dist/**/*.html` pre-deploy (config: `lychee.toml`); fails on broken links.
- `.github/workflows/links_live.yml` — post-deploy lychee crawl of the live
  site (`lychee-live.toml`, which does not exclude www.rnpgp.org) after each
  successful deploy + weekly; this is where the absolute canonical/OG URLs
  get verified in production.
- `.github/workflows/codeql.yml` — CodeQL analysis.

## Gotchas

- `Gemfile.lock`, `_site/`, `vendor/`, `dist/`, `node_modules/`, `parent-hub/`
  are gitignored. `package-lock.json` **is** committed — keep it in sync.
- Old blog URLs (`/blog/DD-MM-YYYY/slug/`) are redirect pages generated from
  posts' `redirect_from` front matter — keep that field when touching old posts.
- The `openpgp_keys/*.asc` files are release-signing keys; treat them as
  immutable unless a key actually rotates.
- Man-page/description strings in `src/content.config.ts` are parsed from the
  AsciiDoc `== NAME` sections — if upstream renames sections, descriptions
  fall back to empty.
- `parent-hub/` was a legacy nested checkout from the Jekyll theme era;
  it has been removed — the footer links to open.ribose.com directly.
- **Tailwind v4 important syntax**: the important modifier is a *suffix*
  (`border-teal!`), not the v3 prefix (`!border-teal`). You rarely need it —
  custom classes in `@layer components` (`.mono-label`, `.btn`, …) lose to
  plain utilities anyway.
- **Teleport + SSR**: never render `<Teleport>` unconditionally in an
  SSR-hydrated island — guard it (`v-if="mounted"`, set in `onMounted`) or the
  hydration tree mismatches ("rendered on server: script, expected:
  Symbol(v-cmt)").
- **Runtime-only URLs**: dynamic `import('/pagefind/pagefind.js')` breaks
  dev/SSR transforms even with `@vite-ignore`; use
  `new Function('u', 'return import(u)')` so Vite never sees the specifier.
