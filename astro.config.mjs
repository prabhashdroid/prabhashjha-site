// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeImageDims from './scripts/rehype-image-dims.mjs';

// Keystatic (the writing UI) needs a server, which would complicate hosting.
// So it is loaded ONLY for `npm run cms` on your own machine.
// `npm run build` stays 100% static — nothing about deployment changes.
const withCMS = process.env.KEYSTATIC === '1';

const cmsBits = withCMS
  ? await (async () => {
      const react = (await import('@astrojs/react')).default;
      const keystatic = (await import('@keystatic/astro')).default;
      const node = (await import('@astrojs/node')).default;
      return { integrations: [react(), keystatic()], adapter: node({ mode: 'standalone' }) };
    })()
  : { integrations: [], adapter: undefined };

export default defineConfig({
  site: 'https://www.prabhashjha.com',
  integrations: [
    mdx(),
    // /search is a noindex utility page — keep it out of the sitemap.
    sitemap({ filter: (page) => !page.includes('/search') }),
    ...cmsBits.integrations,
  ],
  ...(cmsBits.adapter ? { adapter: cmsBits.adapter } : {}),
  // Gives every in-article image real width/height so text never jumps as
  // images load (Cumulative Layout Shift).
  markdown: { rehypePlugins: [rehypeImageDims] },
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
  redirects: {
    // Posts that were stuck on Wix's default demo slugs, renamed to match content.
    '/post/grow-your-blog-community': '/post/what-is-advertising-and-why-digital-marketing',
    '/post/manage-your-blog-from-your-live-site': '/post/networking-the-one-lesson-i-wish-i-had-learned-earlier',
    '/post/design-a-stunning-blog': '/post/how-to-grow-your-brand-using-digital-channels',
    '/privacy': '/post/privacy-policy',
    // Old Wix category URLs. Only the two that genuinely changed are listed:
    // the rest already share their slug with the new pages, and a self-
    // referencing entry makes Astro emit a redirect stub INSTEAD of the page.
    '/blog/categories/ai-automation-1': '/blog/categories/ai-automation',
    '/blog/categories/marketing': '/blog/categories/business',
  },
});
