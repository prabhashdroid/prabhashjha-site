# What's actually in your Wix admin — 3 Aug 2026

Read directly from your Wix dashboard. Nothing here is assumed.

---

## 1. Things I got wrong, corrected

**Your Wix is prepaid until Oct 2027.** The Premium "Light" plan runs on a **2-year cycle**, last paid Oct 16 2025, next payment **Oct 11 2027**. I had been treating Wix as a monthly cost to escape. It isn't — cancelling today saves you nothing before Oct 2027.

**What this changes:** there is no financial urgency and no reason to rush the cutover. You can run the new site in parallel, prove it, and switch calmly. The "zero recurring cost" benefit starts Oct 2027, not now.

**Your domain is registered at Wix**, not an external registrar. It's a *separate* subscription on a 3-year cycle, paid to **Jun 19 2030**. So it survives even if the site plan lapses — but moving hosting means either pointing DNS from inside Wix, or transferring the domain to Cloudflare Registrar. My earlier hosting notes assumed an external registrar. That was wrong.

---

## 2. Real numbers (I had been guessing)

| | Value |
|---|---|
| Site sessions, last 30 days | **45** |
| Post views, last 30 days | 63 |
| Views per individual post | **1–3** |
| New subscriptions, 30 days | **0** |
| Google impressions, last 7 days | **7** |
| Email marketing plan | Free, **no campaigns ever sent** |
| Form submissions (current forms) | 0 |

Google Search Console is **already connected**. AI crawlers do visit — ChatGPT, Gemini, Perplexity and Claude all crawled in the last two weeks.

**One thing to ignore:** Wix's "user queries on AI" panel shows 4 hits against `/.env.save` and `/.env.development.local`. Those are bots probing for leaked credentials, not AI interest. That metric is noise — don't let it flatter you.

---

## 3. Data that dies with Wix — export before Oct 2027

1. **20 contacts**
2. **3 email subscribers**
3. **3 site members** (1 pending approval)
4. **Inbox conversation history** — messages going back to 2024
5. **1 unpublished draft**: "How Prabhash Excels in Marketing Strategy…", last edited 6 days ago — never migrated, because I only scraped published posts
6. 3 old forms

Contacts have a built-in Import/Export. I did not download anything — that's yours to trigger.

---

## 4. Wix features the new site does not have

**Genuine gap — you should decide on this one:**
- **No contact form anywhere.** Wix has forms; the new site offers only a LinkedIn link. A visitor who wants to hire you currently has no way to reach you on the site. This is the one real regression, and it's my omission.

**Present in Wix, absent in the new site, currently unused by you:**
- Blog comments (Wix has them; you have none)
- Site members / login
- Live chat + Inbox
- Email marketing (plan is Free, never used)
- Automations, Pipelines, Loyalty, Meetings/Bookings
- Business email (not connected — dashboard says "No business email")
- E-commerce: Getting Paid, Sales, orders

Of that list you actively use **none**. The only ones worth replacing are the contact form and, arguably, comments.

---

## 5. What I'd do, in order

1. **Add a contact form to the new site** (free: Formspree/Web3Forms free tier, or a `mailto:`). Closes the only real gap.
2. **Export contacts, subscribers and the draft post** out of Wix while it's live.
3. Deploy the new site to Cloudflare Pages on a temporary URL and prove it.
4. Point `prabhashjha.com` at it — from inside Wix DNS, or by transferring the domain to Cloudflare.
5. Leave the Wix plan alone until Oct 2027; you've paid for it. Just stop publishing there.
6. Re-verify Search Console on the new host so the existing history carries over.

**On traffic:** 45 sessions and 7 impressions a week confirms the diagnosis. The new site is faster and better structured, but that alone will not move these numbers. Distribution — you publishing and linking from LinkedIn — is the lever. The site is now a good place to send people; it is not yet a place people find on their own.
