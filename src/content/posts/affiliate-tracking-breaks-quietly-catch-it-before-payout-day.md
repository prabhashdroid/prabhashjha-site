---
title: "Affiliate Tracking Breaks Quietly. Here's How to Catch It Before Payout Day"
slug: "affiliate-tracking-breaks-quietly-catch-it-before-payout-day"
description: "Tracking rarely fails loudly. It fails silently, and you find out at reconciliation. Here's where the click ID actually gets lost, and the ten-minute test to run before a campaign goes live."
pubDate: 2026-08-03
category: "Performance & Affiliate"
---

Most tracking problems do not announce themselves. Nothing errors. No alert fires. The campaign runs, the dashboard fills with clicks, and everything looks normal — right up until the end of the month, when the network's conversion count and yours disagree and somebody has to decide who is right.

By then you are negotiating about the past. That is the worst position to be in, because neither side can prove anything and the money has already been spent.

The fix is not a better tracker. It is checking one thing before launch instead of after payout.

## Everything hinges on one value surviving the journey

Strip away the vocabulary — postback, S2S, pixel, macro, subid — and affiliate tracking is a single idea:

> You attach a unique ID to a click. Later, the advertiser hands that same ID back to you attached to a conversion. Match the two, and you know which click earned the money.

That is the whole mechanism. Which means there is really only one failure: **the ID does not survive the round trip.** Everything else is a variation on that.

When the ID is missing, the conversion still happens. The customer still buys. The advertiser still books the revenue. The only thing that disappears is your ability to prove the sale was yours — and unprovable sales do not get paid.

## The six places the ID actually gets lost

In roughly the order I see them:

**1. It was never in the offer URL.** The click ID exists in your tracker, but nobody appended it to the destination URL. Nothing to hand back. This is the most common one and the most embarrassing, because it is entirely preventable in thirty seconds.

**2. The macro did not resolve.** You put `{clickid}` in the URL and the platform expected `{click_id}` — or the reverse. The unresolved token gets passed through as literal text. Your tracker then tries to match a conversion to a click called `{clickid}`, which does not exist.

**3. The parameter names don't agree.** You send `subid`. They store `aff_sub`. They post back `aff_sub`. Your tracker is listening for `subid`. Both sides are working perfectly and neither can hear the other.

**4. A redirect in the chain strips it.** Every hop between the click and the landing page is a chance to lose the query string. Long chains, shorteners, geo-redirects and consent gateways are all common culprits. The more intermediate hops, the more likely one of them rebuilds the URL from scratch and drops what it does not recognise.

**5. The session broke.** The ID reached the landing page but the conversion happened somewhere else — a different subdomain, an app handoff, a checkout on a separate host, a purchase completed days later on another device. Whatever was holding the ID did not make it across.

**6. The postback fired but nobody was listening.** The advertiser sent it. Your endpoint returned an error, timed out, or sat behind a firewall rule. Many platforms fire once and never retry.

Notice that only one of these is really about the postback URL. The rest happen upstream, before anyone gets near the part most guides spend their time on.

## The ten-minute test that prevents almost all of it

Before a campaign takes real budget, run one conversion through the entire system yourself.

1. **Click your own tracking link.** Not the offer URL — your link, the way a real user would arrive.
2. **Look at the address bar on the landing page.** Is your click ID actually there, in full? Copy it somewhere. If it is missing at this step, stop. Nothing downstream can save you.
3. **Complete the action.** Buy, register, submit — whatever counts as a conversion. Use a test mode if the advertiser has one.
4. **Check that the conversion appears in your tracker**, and that it carries the exact ID you copied in step 2.
5. **Check the advertiser's side too.** Both systems should show one conversion with the same identifier.

If all five line up, your tracking works. If step 2 fails, it is a link problem. If step 4 fails but the advertiser recorded the sale, it is a postback problem. That single distinction tells you which half of the system to look at, which is most of the diagnosis.

Ten minutes before launch. Compare that to a month of disputed conversions.

## When the numbers disagree anyway

They will, sometimes. Some gap is normal — different attribution windows, different timezones, cancelled and returned orders, deduplication rules. A small, stable discrepancy is a fact of the channel, not a bug.

What matters is the shape of it:

- **A small, steady gap** is usually definitional. Find out how each side counts, write it down, and stop relitigating it monthly.
- **A sudden gap** is a break. Something changed — a redirect, a site release, a consent banner, a platform update. Look at what shipped.
- **A gap on one traffic source only** points at that source's redirect chain, not at the offer.
- **A gap that is total** means the ID is not arriving at all. Go back to the ten-minute test.

The useful instinct is to check whether the *pattern* changed, not whether the numbers match exactly. Exact matching is not the goal and never was.

## The habit that actually matters

Test tracking as a launch step, not a troubleshooting step.

Every campaign, every new offer, every time the advertiser redesigns their checkout, every time someone adds a redirect "temporarily". Not because tracking is fragile in some mysterious way, but because it depends on a value surviving a chain of systems that nobody owns end to end — and any one of them can change without telling you.

The people who lose money on affiliate tracking are rarely the ones who do not understand postbacks. They are the ones who found out in week four what they could have found out in minute ten.

## FAQs

### Why do my numbers never exactly match the network's?

Because you are counting slightly different things. Attribution windows, timezones, refund and cancellation handling, and deduplication rules all differ between platforms. A small consistent gap is normal. Agree on the definitions once, document them, and only investigate when the pattern changes.

### Should I use a pixel or a server-to-server postback?

Server-to-server, wherever the advertiser supports it. Pixels run in the browser, so ad blockers, privacy settings, tracking prevention and users closing the tab early all cost you conversions. A postback is a server talking to a server and is not affected by any of that. Use a pixel only when S2S is not offered.

### What is the single most common tracking mistake?

The click ID never making it into the offer URL in the first place. It is trivially avoidable and it silently invalidates the entire chain — every downstream setting can be perfect and you will still get paid for nothing.
