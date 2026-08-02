import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { metaDescription } from '../seo';

export async function GET(context) {
  const posts = (await getCollection('posts'))
    .filter((p) => !p.data.draft && (p.data.slug ?? p.id) !== 'privacy-policy')
    .sort((a, b) => +new Date(b.data.pubDate) - +new Date(a.data.pubDate));
  return rss({
    title: 'Prabhash Jha — Practical Marketing & Founder Playbooks',
    description: 'No-fluff guides on marketing, business and AI from Prabhash Jha, Co-Founder of ADVOLT.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: metaDescription(p.data.description, p.body),
      pubDate: new Date(p.data.pubDate),
      link: `/post/${p.data.slug ?? p.id}/`,
      categories: [p.data.category],
    })),
    customData: `<language>en</language>`,
  });
}
