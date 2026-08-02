# The keyword engine

**You pick a Topic. Everything else is derived at build time.** No keyword fields to fill in — not by you, not by me.

---

## What happens when a post is created

You type a title, choose a Topic from the dropdown, and write. On build, the engine works out the post's keywords from three sources:

1. **The Topic's vocabulary** — every post in *Performance & Affiliate* inherits "performance marketing", "affiliate marketing", "media buying", so the topic accumulates authority instead of each post drifting on its own.
2. **The title and headings** — weighted heavily, because that's what the piece is actually about.
3. **Repeated phrases in the body** — single words and two-word phrases, scored by how often they genuinely recur.

Those keywords are then written into:
- `<meta name="keywords">` on the post
- `keywords` in the **BlogPosting schema**
- `about` — a list of `Thing` entities, which is what Google and AI assistants read to work out a page's subject
- **Related posts** — now chosen by keyword overlap rather than just recency, so articles on the same subject link to each other

Topic pages carry their topic vocabulary in both meta and `CollectionPage` schema.

**Coverage: 40/40 posts, 7/7 topic pages.**

---

## Proof it works with zero input

A brand-new post containing only a title, a Topic and a body — no description, no keywords:

> **How to Set a Break-Even ROAS Before You Scale a Campaign**
> *Topic: Performance & Affiliate*
>
> Generated automatically:
> `Performance Marketing, Affiliate Marketing, Media Buying, Break-even ROAS, Contribution Margin`
> plus a meta description written from the opening paragraph.

"Break-even ROAS" and "Contribution Margin" were never typed anywhere in the frontmatter. The engine found them.

---

## How the quality is protected

Naive keyword extraction produces garbage. Four filters stop that, each added after seeing bad output on your real posts:

| Problem seen | Fix |
|---|---|
| "Key Takeaways", "Seven FAQs" outranking the subject | Section furniture is blacklisted |
| "Quietly Kill", "Kill Beginners" — title fragments | A term must recur in the body, not just appear in the title |
| "Money", "Page", "Trust" — true but useless | Bare words need 4+ occurrences and are capped at 3 per post |
| "Recommend Honestly", "Disclose Openly" | Verb-led phrases are dropped — nobody searches an instruction |
| "Google ADS", "Meta ADS" | Acronym list corrected; only real acronyms are capitalised |

Result on your actual content: *Lead Magnet, Cookie Window, Emergency Fund, Lifestyle Creep, Amazon Associates, High-interest Debt, Landing Page, Contribution Margin.* Those read like things people type into Google.

---

## If you ever want to steer it

**Settings → Topics → SEO keywords** lets you edit a topic's vocabulary. Optional — the engine works without it, and per-post keywords are always derived from the writing itself.

## What it does not do

It won't invent keywords the post doesn't earn, and it won't stuff them into your prose. Keyword meta tags are a weak ranking signal on their own; the real value here is the `about` entities in schema and the automatic internal linking between related articles. Those are what help Google and AI assistants understand what the site is authoritative on.
