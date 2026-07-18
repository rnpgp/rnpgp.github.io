// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.rnpgp.org',
  trailingSlash: 'always',
  // Collapse whitespace to a single space (pre-7 behavior) instead of JSX-style
  // removal, which glued text to adjacent elements ("deployment isMozilla").
  compressHTML: true,
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
