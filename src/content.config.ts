import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from './categories';

/* ============================================================
   Content schema — deliberately forgiving.

   A CMS writes `field:` with nothing after it when you leave a box
   empty, and YAML reads that as null. A strict schema treats null as
   an error and FAILS THE WHOLE BUILD — meaning one blank box in the
   admin takes the entire site offline, not just that one post.

   So every field below accepts null/undefined and falls back to
   something sensible. The rule: a post may be imperfect, the site
   must never be broken.
   ============================================================ */

const VALID = Object.keys(CATEGORY_SLUGS);

/** Accepts null, undefined or a string; always returns a trimmed string. */
const text = (fallback = '') =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => (v === null || v === undefined ? fallback : String(v)).trim() || fallback);

/** Accepts null, a number or a numeric string ("1600"); returns a number or undefined. */
const num = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  });

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: text('Untitled'),
    description: text(),

    // A CMS writes dates unquoted (YAML parses them into a Date object);
    // hand-written files use strings. Accept both, plus blank, and always
    // hand the templates a plain YYYY-MM-DD.
    pubDate: z
      .union([z.string(), z.date(), z.null(), z.undefined()])
      .transform((v) => {
        const today = new Date().toISOString().slice(0, 10);
        if (!v) return today;
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        const s = String(v).slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : today;
      }),

    cover: text().transform((v) => v || undefined),
    coverW: num,
    coverH: num,
    slug: text().transform((v) => v || undefined),

    // Must resolve to a real topic, so a new post can never land on an
    // orphan page that is missing from the homepage and the nav.
    category: text('Digital Marketing').transform((c) =>
      VALID.includes(c) ? c : 'Digital Marketing'
    ),

    draft: z
      .union([z.boolean(), z.string(), z.null(), z.undefined()])
      .transform((v) => v === true || v === 'true'),
  }),
});

/* Editable site pages (About, Work With Me, Newsletter). Same forgiving
   rules as posts: a blank box must never break the build. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: text('Untitled'),
    description: text(),
    eyebrow: text(),
    heading: text(),
    headingAccent: text(),
    intro: text(),
    portrait: text().transform((v) => v || undefined),
    portraitAlt: text(),
    contactHeading: text(),
    contactText: text(),
    ctaHeading: text(),
    ctaText: text(),
    ctaLabel: text(),
    ctaHref: text(),
    services: z
      .union([
        z.array(z.object({ title: text(), blurb: text() })),
        z.null(),
        z.undefined(),
      ])
      .transform((v) => v ?? []),
  }),
});

export const collections = { posts, pages };
