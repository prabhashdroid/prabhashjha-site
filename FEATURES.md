# Every feature, and what each one costs

**Total running cost: £0/month, forever.** Domain already paid to 2030.

---

## Storage

| | Now |
|---|---|
| Whole site | **3.03 MB** (was 4.6 MB) |
| Images | **0.97 MB** — all converted to WebP, 47% smaller, capped at 1600px |
| Files | 178 — Cloudflare's free limit is 20,000 |
| Largest file | 171 KB — free limit is 25 MB per file |
| Bandwidth | **Unlimited** on Cloudflare Pages free |
| Builds | 500/month free; you'd use maybe 8 |

You are using well under 1% of every free-tier limit. There is no growth path where this starts costing money — 40 more posts with images would add roughly 1 MB.

---

## Features, and how each stays free

| Feature | How it works | Cost | Storage used |
|---|---|---|---|
| **Blog** | Markdown files in the repo | £0 | ~25 KB/post |
| **Contact form** | Web3Forms → your email inbox | £0, unlimited | **none** |
| **Comments** | giscus → GitHub Discussions | £0 | **none** (GitHub holds it) |
| **Newsletter** | Buttondown free tier | £0 to 100 subs | **none** |
| **Search** | Pagefind, prebuilt index | £0 | 760 KB, one-off |
| **Analytics** | Cloudflare Web Analytics | £0 | **none** |
| **Admin** | Decap CMS, static files | £0 | **none** |
| **Images** | WebP in the repo | £0 | ~25 KB each |
| **RSS / sitemap / schema** | Generated at build | £0 | ~60 KB |

The pattern: anything that *accumulates* — form messages, comments, subscribers, analytics — is held by a free external service, not by your site. So your storage stays flat no matter how much activity you get.

---

## Contact form

Live on **About** and **Work With Me**. Name, email, message, with a hidden honeypot that stops spam bots. Submits in the background so people stay on your page instead of being thrown to a third-party "thanks" screen.

**Right now it shows a LinkedIn button**, because no access key is set. To switch on the real form: web3forms.com → enter your email → paste the key into **Settings → Contact form**. Free and unlimited. Verified: the moment a key is present, the real form renders.

Adding your email in Settings also adds an "Email me" button.

## Comments

Ready but **deliberately hidden until configured** — an unconfigured comment widget looks broken, so it renders nothing at all. To switch on: giscus.app → pick your GitHub repo → paste the four values into **Settings → Comments**. Comments then live in your own GitHub Discussions, which means you own them and they cost nothing.

---

## Still not built (you don't use them in Wix either)

Live chat, site-member logins, bookings/meetings, loyalty, pipelines, e-commerce. All present in Wix, all showing zero usage on your account. Say the word if you want any of them.

## Deliberate trade-off

You can edit every word on the site from the admin, but you cannot drag blocks around to change layout. That constraint is what keeps the site at 3 MB and £0.
