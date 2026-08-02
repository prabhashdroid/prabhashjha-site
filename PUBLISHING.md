# Publishing, and why new posts are SEO-ready on their own

## 1. Opening the admin

**Right now, on your Mac** — one command, in the `prabhashjha-site` folder:

```bash
npm run admin
```

Then open **http://localhost:4321/admin/index.html** and click **Login** (no password — it's your own machine).

You get: the post list, a Title / URL slug / Description / Date / **Topic** / Cover image form, a markdown editor, and a live preview beside it. Saving writes a real file into `src/content/posts/`. Press `Ctrl+C` in the terminal to stop.

> On the local server the URL needs the `/index.html` on the end. Once the site is deployed, plain `/admin` works — that's a quirk of the dev server, not the site.

**After the site is live**, the same screen is at `https://www.prabhashjha.com/admin` and you log in with GitHub. That needs the 5 steps in `ADMIN-SETUP.md` done once. Same interface either way — nothing new to learn later.

> `npm run cms` (Keystatic) is currently broken by an upstream bug in Astro's React dev pipeline — everything is already on the latest version, so there's nothing to upgrade. Use `npm run admin`; it's the one you'll use in production anyway.

## 2. What happens automatically when you publish

You fill in a title, a topic and the body. Everything below is generated at build time, every time, with no action from you:

| Generated automatically | From what |
|---|---|
| `<title>`, meta description, canonical URL | title + description |
| Open Graph + Twitter cards (link previews) | title, description, cover |
| **`BlogPosting` schema** — author, publisher, date, section, word count | the post + your Person record |
| **Breadcrumbs** Home › Topics › *Topic* › *Post* | the topic you picked |
| Entry in the sitemap, the RSS feed, the homepage, the topic page | automatic |
| Entry in the on-site search index | automatic |
| Image `width`/`height` | **read out of the image file itself** |
| Related posts at the bottom | matched on topic |

Your author identity (`@id`) is attached to every post, which is what lets Google and AI assistants connect all 40 posts to one person rather than 40 unrelated pages.

## 3. The safety nets (this is the part that matters)

The original setup would have broken. Three real failures, found by publishing test posts rather than assuming:

1. **A blank field took the whole site down.** Leaving the description box empty writes `description:` with nothing after it, YAML reads that as `null`, and the build *failed completely* — not just that post, the entire site would stop deploying. The schema now accepts blank for every field.
2. **There was no Topic box at all.** Every new post silently got the category `Marketing`, which isn't one of your seven — it would have created an orphan page missing from the homepage and the nav. There's now a dropdown, and a typed-in bad value falls back instead of breaking.
3. **Uploaded images had no dimensions**, which brings back layout shift and a Core Web Vitals penalty. Dimensions are now read directly from the image file at build time.

Also handled without you thinking about it:
- **No description?** One is written from your opening paragraph.
- **Too long?** Trimmed at a sentence boundary near 158 characters.
- **No date?** Today's date.
- **Bad date?** Today's date.

Tested: a post with nothing but a title and a body still builds, gets a description, a date, a topic, breadcrumbs, full schema, and appears in the sitemap, RSS, search, homepage and topic page.

## 4. The only two things you must get right

Everything else self-corrects. These two can't:

1. **The URL slug** — never change it on a post that's already published. That's the one thing that breaks your Google ranking, and no amount of automation can undo it.
2. **The topic** — pick from the dropdown so the post lands on a real topic page.

## 5. Going live after an edit

Once deployed to Cloudflare Pages, saving in the admin commits to GitHub, which triggers a rebuild — sitemap, RSS, schema and search index all regenerate. Live in about a minute. Nothing manual, no monthly cost.
