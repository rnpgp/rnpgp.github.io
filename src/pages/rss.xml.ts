import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'RNP Blog',
    description: 'Releases, news and updates on the RNP project.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt ?? p.data.title,
      link: `/blog/${p.id}/`,
    })),
  });
}
