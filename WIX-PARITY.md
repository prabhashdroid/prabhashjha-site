# Your 7 questions, answered straight

## The one thing that explains 4 of the 7

Wix bundles a **server and a database**. Your site is **static files** — that is exactly why it's 3 MB, scores 96–99, and costs £0 forever.

Inbox, Leads, Automations and Wix's "CMS collections" all need somewhere to *store data that arrives after the site is built*. Static files can't do that. This isn't a thing I forgot — it's the trade that buys the speed and the zero cost.

**But it is fixable for £0.** Cloudflare Pages Functions (100k requests/day free) + Cloudflare D1, a real SQL database (5 GB, 5M reads/day free) would give you a genuine inbox, leads table and automations, still at no cost. It's real added complexity, and it only exists once we deploy. Your call — see the bottom.

---

## 1. Lighthouse / performance — DONE ✅

```bash
npm run perf
```

Runs Lighthouse locally against 4 page types, prints scores + Core Web Vitals, and **exits with an error if anything drops below budget** (perf 95, a11y 95, best-practices 95, SEO 100). Free, offline, no account.

Current, measured:

| Page | Perf | A11y | Best | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| homepage | 99 | 100 | 100 | 100 | 2.1 s | 0 | 0 ms |
| blog index | 96 | 100 | 100 | 100 | 2.7 s | 0 | 0 ms |
| a post | 98 | 100 | 100 | 100 | 2.3 s | 0 | 0 ms |
| about | 96 | 100 | 100 | 100 | 2.7 s | 0 | 0 ms |

It immediately caught a real defect: `--color-dim` was **3.08:1 contrast, below the 4.5:1 minimum**, on footer text and the privacy link. Fixed to #737B91 (4.57:1) — same hue, smallest lift that passes. Accessibility went 95 → **100**.

LCP of ~2.1–2.7 s is measured on a *throttled* connection against a plain local file server with no caching. On Cloudflare's CDN with the cache headers already in `_headers`, expect materially better.

## 2. Site security — mostly automatic, and already partly shipped

| Protection | How you get it | Cost |
|---|---|---|
| HTTPS / SSL certificate | Cloudflare, automatic on deploy, auto-renews | £0 |
| DDoS protection | Cloudflare, always on | £0 |
| Web Application Firewall | Cloudflare free tier | £0 |
| **Attack surface** | **A static site has no database, no login, no PHP — nothing to inject into or breach.** Wix needs a WAF partly because it runs a server; yours doesn't. | — |
| Security headers | Already shipping in `public/_headers` | £0 |
| Uptime monitoring | UptimeRobot free tier (50 monitors) — needs a signup | £0 |

Already live in `_headers`: `Strict-Transport-Security` (HSTS, 1 year, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` (geolocation/mic/camera off).

Not yet added: a **Content-Security-Policy**. It's the strongest header, but the site uses inline scripts for the animations, so a strict CSP needs per-script hashes. Doable, worth doing after deploy — I'd rather add it carefully than ship one that silently breaks your animations.

## 3. Marketing tab — half of it is already automated, half is other people's tools

Wix's Marketing tab is four things:

- **SEO** — already done, and more thoroughly than Wix: automatic keywords, FAQ schema, BlogPosting + breadcrumbs, sitemap, RSS. You never touch it.
- **Email campaigns** — Buttondown free tier. Its own dashboard.
- **Social posts** — Wix schedules posts; you'd post to LinkedIn yourself, which is the channel that actually matters for you.
- **Google/Meta ads** — you run these professionally; you would not use a Wix ads widget.

I can add a **Marketing page inside the admin** that links out to each dashboard and shows what's connected — a launchpad, not a fake copy of tools that live elsewhere.

## 4. Inbox — real gap, and I under-solved it

Right now the contact button opens the visitor's email client and the message lands in `prabhashjha@live.in`. Your email *is* the inbox — you reply from there. But there's no record in the admin, no status, no "captured detail".

Two ways to fix:

- **Free, no build:** add the Web3Forms key. Submissions then arrive as proper emails *and* appear in Web3Forms' own dashboard. 5 minutes.
- **Proper, still £0:** Pages Function writes each submission to D1; a new **Inbox** section in the admin lists them with name, email, message, date and read/unread. You'd still reply by email — sending mail needs a provider — but every enquiry is captured and searchable.

## 5. Customers & Leads — same story

Once #4 exists, leads are the same table with a status field (new / contacted / won / lost) and notes. Newsletter subscribers live in Buttondown and can be listed alongside. Genuinely buildable at £0, on the same infrastructure as the inbox.

## 6. Analytics & Automation

- **Analytics** — Cloudflare Web Analytics, free, privacy-first, no cookie banner needed. Enable it in the Cloudflare dashboard; it injects itself. It has its own dashboard, which I can link from the admin. Deeper than Wix's on Core Web Vitals.
- **Automation** — Wix automations are "when X, do Y" (form submitted → email me). With Pages Functions those become real: notify on submission, auto-reply, weekly digest. Needs the same backend as #4.

## 7. CMS — you already have one ✅

This is a naming clash, not a missing feature.

- **Content CMS** — Posts, Pages, Settings, Media. **You have this**, it's the admin you're already using.
- **Wix's "CMS" tab** — custom *data collections*: arbitrary tables (testimonials, projects, a directory) you can create and display on pages. **That** you don't have, and it needs the same database as #4.

If you want a Testimonials or Case Studies collection, say so — that's a content collection I can add to the admin today, no database needed, because it's known at build time.

---

## What I'd actually do

**Deploy first.** Every remaining item (#4, #5, #6, and the CSP in #2) either needs Cloudflare or is easier once it exists. Building an inbox before there's a site to receive enquiries is the wrong order.

Then, in one go: Pages Function + D1 → Inbox + Leads + Automations in the admin, plus Analytics and Marketing launchpad pages. Still £0/month.

**One honest caveat:** that backend is the first thing in this build with moving parts that can break. Static files basically cannot fail. A database and functions can. It's still the right call if you want leads captured — but it's a real step up in complexity, and you should choose it deliberately rather than because Wix had a tab for it.
