import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { renderAdoc, splitFrontMatter } from '@/lib/asciidoc';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const dir = join(process.cwd(), 'src/content/blog');
  const files = new Set(readdirSync(dir));
  const fullContent = async (id: string) => {
    const file = `${id}.adoc`;
    if (!files.has(file)) return undefined;
    const { body } = splitFrontMatter(readFileSync(join(dir, file), 'utf8'));
    const { html } = await renderAdoc(body);
    return html;
  };

  const items = await Promise.all(
    posts.map(async (p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt ?? p.data.title,
      link: `/blog/${p.id}/`,
      content: await fullContent(p.id),
    })),
  );

  return rss({
    title: 'RNP Blog',
    description: 'Releases, news and updates on the RNP project.',
    site: context.site!,
    items,
  });
}
