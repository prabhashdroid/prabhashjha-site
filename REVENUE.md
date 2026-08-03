# What stops this site earning — audit, 3 Aug 2026

## Read this first

**Traffic is the binding constraint, not plumbing.** The site does roughly
**45 sessions a month** and **7 Google impressions a week**.

At that volume:

| Network | Minimum | Status |
|---|---|---|
| Google AdSense | none | would earn low single-digit ₹/month |
| Ezoic | ~10,000 sessions/mo | ~220× short |
| Mediavine | 50,000 sessions/mo | ~1,100× short |
| Raptive | 100,000 sessions/mo | ~2,200× short |

Everything below was worth fixing — several items would have cost real money or
an account ban later — but none of it produces income until traffic moves.
Display ads on a 45-session site are not a revenue plan; they are a tax on the
reading experience. The honest sequence is **traffic → email list → affiliate or
product → display ads last, if ever**.

## Fixed

### 1 · Ad crawlers were not named in robots.txt — REAL
Google's **AdsBot crawlers deliberately ignore `User-agent: *`**. That is
documented behaviour, not a quirk: a wildcard rule does not govern them. So the
previous file said nothing to them at all.

Consequence, had ads been run: Google Ads could not fetch landing pages to score
them, which degrades Landing Page Experience and **raises CPC on every campaign
pointed at the site**. `Mediapartners-Google` was likewise unnamed, so AdSense
could not read a page to decide which ads suit it.

`Mediapartners-Google`, `AdsBot-Google`, `AdsBot-Google-Mobile` and
`AdsBot-Google-Mobile-Apps` are now named explicitly with `Allow: /`.

### 2 · Outbound links carried no `rel` — REAL, security and SEO
Every external link in an article body now gets `rel="noopener noreferrer"` and
`target="_blank"`, applied at build time by `scripts/rehype-outbound-links.mjs`.
`noopener` is a genuine security fix: without it the opened page can reach back
through `window.opener` and navigate this one somewhere else. Footer social
links got the same treatment.

### 3 · No affiliate compliance rails — REAL, and the expensive one
There are currently **zero affiliate links on the site**, so nothing is in
breach today. But there was also nothing stopping the first one from shipping
non-compliant, and Amazon Associates terminates for a missing disclosure —
usually permanently.

Now in place:

- `monetisation.affiliateDomains` in `site.json` lists commercial hosts.
- Links to those hosts automatically get **`rel="sponsored"`**, which Google
  requires. An unmarked affiliate link risks a manual action that would cost
  more traffic than the link earns.
- `affiliate: true` on a post renders an FTC disclosure **above the article**,
  in reading colour, not buried in a footer.
- **`check-posts.mjs` fails the build** if a post links to a configured
  affiliate domain without `affiliate: true`. Not a warning — a hard stop.
- The toggle is exposed in the Decap admin, so it survives editing.

Verified end to end: an undisclosed affiliate link exits 1 with a named error;
adding the flag exits 0; the built link carries
`rel="noopener noreferrer sponsored"`.

### 4 · ads.txt — deliberately still absent
`/ads.txt` 404s, and that is the correct state. **An ads.txt that exists but
lists no sellers is worse than no file**: the spec treats it as exhaustive, so
exchanges read it as "nobody is authorised to sell this inventory" and drop the
bids. Shipping a placeholder would have actively blocked programmatic demand.

`src/pages/[adsTxt].ts` generates the file **only** once
`monetisation.adsTxt` in `site.json` has content. Paste the lines your network
gives you and it appears; leave it empty and nothing is emitted.

### 5 · Privacy policy was factually wrong and consent-blind — REAL
It claimed **"The site is hosted on Wix"**. It has not been for some time. A
privacy policy that misstates who processes your visitors' data is a liability,
not a formality.

Corrected to Cloudflare Pages, and rewritten to state accurately that the site
currently sets **no advertising or tracking cookies** (Cloudflare Web Analytics
is cookieless). Added a **Consent** section and an **Affiliate links** section.

## Needs your action — I cannot do these

| # | What | Why it blocks money | Who |
|---|---|---|---|
| 1 | **Newsletter is not connected** | `buttondownUsername` is empty, so the page shows "Follow on LinkedIn for now". Every would-be subscriber is lost. The email list is the one asset that compounds and that no algorithm can take away. | Needs a Buttondown account |
| 2 | **Contact form is not connected** | `formAccessKey` is empty, so it degrades to a `mailto:` link. Mailto converts far worse than a form — most people never complete it. This is the actual enquiry path for paid work. | Free key at web3forms.com |
| 3 | **No consent banner** | Google requires a **certified CMP** to serve ads to EEA/UK visitors. Until one exists, EU ad revenue is zero regardless of anything else. Not needed until ads go live. | Vendor choice |
| 4 | **No AdSense account** | Nothing to put in `ads.txt`. | Your application |

## Not done, and why

- **No display ad slots added.** At 45 sessions they would earn nothing while
  costing layout shift and reading quality. Ads are the last step, not the
  first.
- **No consent banner installed.** It would be dead weight while the site sets
  no ad cookies, and the vendor choice is yours.
- **No affiliate links inserted.** Which products to endorse is a judgement
  about your own credibility, not a technical decision. The rails are ready.

## The order I would actually do this in

1. Connect the newsletter and the contact form. Two free accounts, and they are
   the only two things on this list that can earn money at current traffic.
2. Publish and distribute. Traffic is the constraint; everything else is
   downstream of it.
3. Add affiliate links to the posts that already rank, once there are any —
   the rails and the guard are in place.
4. Consider display ads only past ~10,000 sessions/month, and a CMP with them.
