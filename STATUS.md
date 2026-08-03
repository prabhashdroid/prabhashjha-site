# Where we are — 3 Aug 2026

Start here. Everything is committed; the working tree is clean.

## The site is finished

39 posts, 7 topic pages, search, RSS, full schema, contact form, dark admin.
0 type errors · 1,813 internal links, 0 broken · 3.07 MB total · 0 Wix references.

**Nothing is live yet.** It exists only on this Mac, in git, with 2 commits.

## To pick up where we stopped

```bash
cd ~/ADVOLT/prabhashjha-site
npm run admin
```

- Admin → http://localhost:4321/admin/index.html (click Login, no password)
- Site → http://localhost:4321

## LIVE NOW ✅

**https://prabhashjha-site.pages.dev** — deployed from GitHub, auto-deploys on every push.
Cloudflare Web Analytics enabled and verified. Real 301s for all old Wix URLs.

- GitHub: `prabhashdroid/prabhashjha-site` (public), SSH key on this Mac
- Cloudflare account: Prabhash470@gmail.com, Free plan
- Cloudflare zone `prabhashjha.com` created, **pending nameserver change**
- AI crawl policy: Search = Allow, Agent = Allow, "block training in robots.txt" turned OFF
  (so the robots.txt welcoming GPTBot/ClaudeBot/PerplexityBot stays authoritative)

## DOMAIN: www CNAME changed — NOT YET SERVING (3 Aug 2026)

`www.prabhashjha.com` CNAME at Wix now points to `prabhashjha-site.pages.dev`,
and Cloudflare Pages shows the custom domain **Active, SSL enabled**.

**But www is still being served by WIX, not Cloudflare.** Proof:
`server: Pepyaka` + `x-wix-request-id` + Fastly `x-served-by` headers.

Do not be fooled by pages that return 200 — Wix has its own copies of `/`, `/blog/`,
`/about` and every `/post/...` URL, and their SEO titles were deliberately made
identical in an earlier session. The tell is that `/search`, `/rss.xml`,
`/sitemap-0.xml`, `/admin/`, `/pagefind/*` and `/downloads/*.xlsx` all 404 — those
exist only on the new site.

**Likely cause:** the old record had a 1-hour TTL, and the domain is still *assigned
to the Wix site*, so Wix's edge keeps answering.

**Next steps, in order:**
1. Wait out the 1-hour TTL, then re-check `curl -sI https://www.prabhashjha.com/ | grep -i server`
   — it must say `cloudflare`, not `Pepyaka`.
2. If it still says Pepyaka: Wix → Domains → `...` → **Unassign from this site**.
   That detaches the domain from the Wix site so Wix stops answering for it.
3. Re-verify with the checklist below. All of these must be 200:
   `/search` `/rss.xml` `/sitemap-0.xml` `/admin/` `/pagefind/pagefind.js`
   `/downloads/unit-economics-sheet.xlsx`, and `/post/design-a-stunning-blog` must 301.

## DOMAIN TRANSFER (separate, still open)


**Correction to an earlier note:** the nameserver change was not blocked by browser
automation. Wix simply does not permit it — their DNS page states plainly
*"NS records are not editable"* for a Wix-registered domain. A and CNAME records
are editable; nameservers are not. So the chosen route was impossible, and after
reviewing the options Prabhash chose to move the registration.

**Done (3 Aug 2026):** "Transfer away from Wix" started. Wix emailed the transfer
authorization code to **prabhash470@gmail.com**. Auto-renewal at Wix is now OFF
(expected — the transfer must be completed or the domain eventually lapses).

**Next, needs Prabhash:**
1. Get the transfer authorization code from that Gmail inbox.
2. Cloudflare → Domain Registration → Transfer Domains → `prabhashjha.com` → paste the code.
3. **Pay ~$10 for one year.** Claude does not make purchases or enter card details —
   this step is Prabhash's. By ICANN rules the transfer ADDS a year, so the prepaid
   term to Jul 2030 is not lost; it becomes 2031.
4. Approve the confirmation email that follows. Completion takes up to 7 days.

**Once the transfer completes:**
1. Cloudflare zone `prabhashjha.com` (already created, currently pending) goes active
   automatically, since Cloudflare will be the registrar.
2. Pages → prabhashjha-site → Custom domains → add `www.prabhashjha.com` **and** `prabhashjha.com`.
3. Delete the 4 leftover Wix records (3 A + 1 CNAME) from the Cloudflare DNS zone.
4. Re-verify Google Search Console on the new host; submit the sitemap.
5. Fill `base_url` in `public/admin/config.yml` with the OAuth worker URL (see ADMIN-SETUP.md)
   so `/admin` logs in via GitHub in production.

**Meanwhile nothing is broken:** prabhashjha.com still serves the Wix site until the
transfer completes and DNS moves. The new site remains live at
https://prabhashjha-site.pages.dev.

## Remaining accounts, in this order

| # | Service | Why it's needed | Blocked by |
|---|---|---|---|
| 1 | **GitHub** | Cloudflare deploys from it; admin logs in through it; comments attach to it | — |
| 2 | **Cloudflare** | Hosting (free). Analytics is a dashboard toggle, no token needed | needs 1 |
| 3 | Buttondown | Newsletter signups | optional |
| 4 | Web3Forms | Turns the contact form from an email button into a real form | optional |
| 5 | Google Search Console | Submit the sitemap, verify ownership | needs 2 |

We stopped mid-way through **step 1**. Outstanding decision: **public or private GitHub repo** — public is recommended, because comments (giscus) only work on a public repo.

Prabhash creates each account; Claude does not create accounts or handle passwords.

## Do NOT cancel Wix

Premium is **prepaid to Oct 2027** (2-year cycle) and the **domain is registered at Wix**, paid to Jun 2030. Leaving Wix means: deploy → point the domain → stop publishing there → let it lapse in 2027. Cancelling early refunds nothing and risks DNS.

Before Oct 2027, transfer the domain to Cloudflare Registrar. **Unverified:** whether Wix keeps DNS management available once Premium lapses — check this before relying on it.

## Export from Wix before it lapses

20 contacts · 3 email subscribers · 3 site members · Inbox history back to 2024 · **1 unpublished draft** ("How Prabhash Excels in Marketing Strategy") that was never migrated.

## The other docs

| File | What's in it |
|---|---|
| `AUDIT.md` | Full build audit, bugs found and fixed |
| `WIX-AUDIT.md` | What's in the Wix account, real traffic numbers, migration facts |
| `FEATURES.md` | Every feature and why each costs £0 |
| `SEO-ENGINE.md` | How keywords/FAQ schema are generated automatically |
| `PUBLISHING.md` | How to publish a post, and the safety nets |
| `PUBLISHING-STANDARD.md` | How posts get researched before writing |
| `ADMIN-SETUP.md` | The 5 deploy steps for browser publishing |
| `HOSTING.md` | Hosting notes — **assumes an external registrar; the domain is actually at Wix** |

## Reality check to carry into tomorrow

45 sessions/month and 7 Google impressions/week. The new site is faster and better structured, but that alone won't move those numbers. Distribution — publishing and sharing to LinkedIn — is the lever. The site is now a good place to send people; it is not yet a place people find on their own.
