# Full site audit — 3 Aug 2026

Everything below was measured on the built site or tested in a browser. Nothing is assumed.

---

## Your criticism was correct

I built a blog CMS and presented it as an admin. You'd asked for Wix-level control; you got one collection with seven fields. Everything else — your About page, Work With Me, the homepage headline, your job title, your social links, the newsletter provider, analytics, the topic list — was hardcoded and needed me to change.

That's now fixed. **The admin has three sections: Posts, Pages, Settings**, and 32 editable fields covering every piece of copy and configuration on the site.

---

## DONE

### Admin
- Posts — create, edit, delete, with Topic dropdown, image upload, live preview
- **Pages — About / Work With Me / Newsletter**: title, SEO description, headings, intro, photo, service cards, buttons, full body
- **Settings — one screen** for: your name, job title, bio, city, expertise; company name + description; contact email; all four social links; newsletter provider; analytics token; Search Console code; the entire homepage (badge, headline, intro, both buttons, stat, feature block); all seven topics (name, description, URL slug); footer text
- Media library with upload
- Runs locally with `npm run admin`, no password, no internet
- **Save path tested end to end**: edited a page via the admin API → file changed on disk → change appeared on the built page → reverted cleanly
- Renaming a topic no longer breaks its URL — the slug is stored separately

### Content integrity
- 39 posts, all 42 images self-hosted, **0 Wix references anywhere**
- Lead magnet spreadsheet pulled off Wix and self-hosted
- 3 posts moved off Wix demo slugs, with 301s from the old URLs
- 8 over-long descriptions trimmed at sentence boundaries
- Every post has a cover image and a valid topic

### Findability
- `BlogPosting` + `BreadcrumbList` on 40 posts, `CollectionPage` + `ItemList` on 7 topic pages, `Person`/`Organization`/`WebSite` sitewide — all cross-linked by `@id`, all now driven by Settings
- Sitelinks SearchAction, RSS (39 items), sitemap (52 URLs), robots.txt allowing GPTBot / ClaudeBot / PerplexityBot / OAI-SearchBot and the rest
- **1,813 internal links checked, 0 broken**

### Speed and robustness
- 49 KB CSS+JS for the whole site; fonts self-hosted; **zero third-party requests**
- Image dimensions read out of the image file at build time — no layout shift
- On-site search (Pagefind, 40 docs)
- 0 TypeScript errors; `npm run check`
- Mobile 375px verified: no horizontal overflow on any page type

### Bugs found and fixed
1. **A blank field in the admin failed the entire build** — one empty description would have stopped the whole site deploying
2. **5 of 7 topic pages didn't exist** — self-referencing redirects replaced them with stubs
3. **No Topic field existed** — every new post would have been filed under a category that isn't one of your seven
4. **Content could stay permanently invisible** if `requestAnimationFrame` never fired
5. Dead classes from the old palette; footer tap targets under Google's 24px minimum

---

## PENDING

### Blocking — nothing else matters until this is done
1. **The site is not live.** It exists only on your Mac. prabhashjha.com still serves Wix. Needs your Cloudflare + GitHub login.

### Needs your login (5 minutes each, all free)
2. Buttondown username → newsletter starts collecting emails (currently collects nothing)
3. Cloudflare Web Analytics token → traffic visibility (currently none)
4. Google Search Console → submit sitemap, verify ownership
5. Deploy the OAuth worker (`ADMIN-SETUP.md`) → browser publishing without me

### Decisions for you
6. Contact email — not published anywhere; say the word and I'll add it
7. The weekly authoritative post — the content engine is built, the content is yours

### Known limitations
8. `npm run cms` (Keystatic) is broken by an upstream bug in Astro's React dev pipeline. Everything is on the latest version; nothing to upgrade. Use `npm run admin`.
9. The admin edits copy, not layout. You cannot drag blocks around like Wix — that trade buys you a site that loads in 49 KB and costs nothing to run.
10. No comments, no e-commerce, no booking system. Not built because you haven't asked for them.

---

## Honest comparison

| | This site | Wix | Ghost / Substack |
|---|---|---|---|
| Cost | £0 forever | ~£15–25/mo | £9–25/mo |
| Page weight | 49 KB | 2–4 MB | ~300 KB |
| Schema depth | Person + Org + BlogPosting + Breadcrumbs + Collection | basic Article | basic Article |
| Edit copy in browser | yes | yes | yes |
| Drag-and-drop layout | **no** | yes | no |
| You own the content | yes, plain files | no | partly |

The one thing Wix does that this doesn't is visual layout editing. Everything else here is ahead.
