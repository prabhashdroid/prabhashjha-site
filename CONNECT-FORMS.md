# Connecting the newsletter and the contact form

Two free accounts. About five minutes total. **No code, no terminal, no deploy** —
both values are fields in your own admin at
[www.prabhashjha.com/admin](https://www.prabhashjha.com/admin) → **Settings**.
Saving there commits to GitHub and rebuilds the site automatically.

I verified both integrations against the live provider APIs and tested the wiring
with dummy values, so the moment you paste a real one it works. Details at the
bottom if you want them.

---

## 1 · Contact form — Web3Forms

This is the higher-value one: it's the enquiry path for paid work, and right now
it degrades to a `mailto:` link, which most people never complete.

1. Go to **https://web3forms.com**
2. Enter the inbox you want enquiries delivered to. Use one you read daily.
3. They email you an **Access Key** — a long string like
   `a1b2c3d4-e5f6-...`. No password, no dashboard to manage.
4. Admin → **Settings** → **Contact form** → paste it into **Web3Forms access key**.
5. Save.

**Then test it yourself:** open `/work-with-me`, send a real message, and confirm
it arrives. If it doesn't, the key is wrong — nothing else can break here.

What you get: a real three-field form, spam honeypot already wired, submitted in
the background so nobody is bounced to a third-party "thanks" page. Unlimited
submissions, free, no storage on your side.

---

## 2 · Newsletter — Buttondown

1. Go to **https://buttondown.com** and create the account.
2. Pick your **username** during signup. This is the bit that matters — it
   becomes part of your subscribe URL, and it is *not* your email address.
   You can see it at Settings → Basics, or in your newsletter URL:
   `buttondown.com/<username>`.
3. Admin → **Settings** → **Newsletter** → paste it into **Buttondown username**.
4. Save.

**Then test it:** open `/newsletter`, subscribe with your own address, and check
you get the confirmation email.

Free tier covers the first 100 subscribers, which is well beyond where you are.

> While this is empty, the page shows "Follow on LinkedIn for now" instead of a
> form. That is a deliberate fallback, not a bug — but it means every person who
> would have subscribed is currently lost.

---

## 3 · While you're in there — analytics

**Settings → Analytics → Cloudflare Web Analytics token** is also empty.

Cloudflare Pages is already injecting the beacon automatically (I confirmed
`cloudflareinsights` is on the live pages), so you *do* have analytics. This
field is only needed if you ever want the script shipped from the site itself
rather than injected at the edge. **Leave it empty** unless that changes.

---

## What I checked, so you don't have to debug it

| Check | Result |
|---|---|
| Web3Forms endpoint live and correct | `api.web3forms.com/submit` responds; rejects a missing key with a clear error |
| Buttondown URL shape current | Buttondown's own legacy host redirects to exactly the URL this site builds |
| Form renders correctly once configured | Tested with dummy values — correct action URL, `email` field, key injected, honeypot present, LinkedIn fallback correctly disappears |
| Both fields editable without code | Confirmed present in the admin Settings screen |

A note on the Buttondown check: probing with a fake username returns **404**.
That is "no such newsletter", not "wrong URL" — the path itself is confirmed
correct by Buttondown redirecting their old host to it.

---

## Why I could not do this for you

Creating accounts and entering passwords is something I don't do, on any site,
even when asked directly — a credential I set is one you don't control and can't
audit. Everything up to that line is done: the code is correct, the fields exist,
the wiring is tested, and the admin is the only place you need to go.
