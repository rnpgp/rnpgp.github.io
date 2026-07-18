# rnpgp.org

Source of <https://www.rnpgp.org> — the website of **RNP**, the open-source
LibrePGP/OpenPGP library and toolset that powers end-to-end email encryption in
Mozilla Thunderbird.

The site is a static build with **Astro 7** (Vite 8 / Rolldown), **Tailwind
CSS 4** (via the Vite plugin) and **Vue 3** interactive islands, deployed to
GitHub Pages.

## Quick start

Requires Node.js ≥ 22.12.

```console
npm install
npm run dev        # fetch-sources + local dev server
```

## Commands

| Command                  | What it does |
|--------------------------|--------------|
| `npm run dev`            | Dev server (auto-runs `fetch-sources` first) |
| `npm run build`          | Production build to `dist/` (auto-runs `fetch-sources`; post-build runs Pagefind indexing) |
| `npm run preview`        | Preview the production build locally |
| `npm run fetch-sources`  | Sparse-clone software repos into `vendor/` (docs + man pages) |

## Repository layout

- `src/pages/` — routes (home, about, software, specs, blog, advisories, docs, …)
- `src/content/` — authored content: `blog/*.adoc`, `advisories/*.adoc`,
  `software/*.md`, `specs/*.md` (Astro content collections)
- `src/content.config.ts` — collection schemas + loaders
- `src/lib/asciidoc.ts` — Asciidoctor.js wrapper and the custom content loader
  that renders `.adoc` sources to HTML at build time
- `scripts/fetch-sources.mjs` — clones each software repo (sparse, depth 1)
  into `vendor/` so product docs and man pages can be rendered on-site
- `src/components/` — Astro components; `src/components/vue/` — Vue islands
- `public/` — static assets (fonts, brand, OpenPGP keys, favicons)
- `vendor/` — pulled-in repositories (gitignored, regenerated)

See `AGENTS.md` for full conventions (content authoring, releases, CI).
