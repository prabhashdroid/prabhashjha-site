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

## Next task: deploy — 5 accounts, in this order

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
