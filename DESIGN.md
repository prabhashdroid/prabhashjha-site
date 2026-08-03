# The design system

What the site looks like, why, and what is deliberately absent. Four commits:
`4ca35f2` → `f5e437a`.

## The problem being solved

The previous build was near-black with a blue-violet gradient, Space Grotesk,
glass panels and rounded cards. That exact combination is the current default
look of AI-generated websites. It is also the look of a SaaS product page —
and this is not a product, it is a body of writing by one person.

## The direction

The subject is the arithmetic of marketing: reconciliation, attribution, unit
economics. That world's vernacular is the **ledger and the printed page**, so
the design borrows from print and accounting rather than from software
marketing.

| | |
|---|---|
| **Ground** | `#0E0F0D` — near-black with a **warm** bias, not blue-black. Light theme is designed separately: `#F4F3EF` warm paper, `#17180F` ink. |
| **Accent** | **One.** `#D9A441` ledger amber (dark) / `#8A5A12` (light) — the colour of a highlighted cell. No second accent anywhere. |
| **Type** | Newsreader for everything readable, IBM Plex Mono for labels and figures. Serif needs far less negative tracking than a grotesque, so headings sit at `-0.012em`, not `-0.04em`. |
| **Radius** | Zero, globally. The grid and the rules carry the structure. |
| **Depth** | Hairlines and a luminance step. No shadows. |
| **Figures** | `tabular-nums` wherever numbers are counted or compared. |

Structure comes from **hairline rules**, not cards. A grid of cards reads as a
product listing; a ruled stack reads as a publication.

## What each page became

- **Homepage** — a masthead, not a product hero: label, statement, standfirst,
  then a colophon row of three figures. Then the lead story, then the topics as
  a **contents page**.
- **Topics** — the decorative `01 / 02 / 03` markers are gone. Topics are a
  menu, not a sequence, so numbering them encoded nothing. The guide **count**
  stayed, because that is the one figure that carries information.
- **Blog index** — Wired's story-row pattern: one column, hairline dividers,
  the image kept small and to the side.
- **Post** — breadcrumb, headline, standfirst, then a ruled byline with the
  reading time in tabular figures. Section headings sit under their own rule.
- **About / Work with me / Newsletter / 404** — same ruled treatment,
  left-aligned. (Centred body copy was another tell of the old look.)

## Motion

Built against the **official GreenSock skills** (`greensock/gsap-skills`, MIT,
first-party), installed at `.claude/skills/gsap-*`.

**Scroll and pointer — GSAP + ScrollTrigger**

- Scroll reveals via `ScrollTrigger.batch()`, so a row of four animates as one
  group rather than as four triggers with hand-rolled delays.
- Parallax on cover images: the image is pre-scaled to 1.14 inside a fixed
  frame, so the ±5% drift can never expose an edge and the frame's own box
  never moves. **Measured at zero layout shift.**
- Reading progress driven by `scaleX`, not by animating `width` — width would
  force a relayout on every frame.
- A 3° pointer tilt on the lead image, a 6px magnetic pull on the primary CTA.
  Both `(hover: hover) and (pointer: fine)` only.
- Page transitions through Astro's ClientRouter, with covers carrying a shared
  `transition:name` so a thumbnail morphs into the article's hero image.

**Hover — CSS**

Rules that draw left-to-right under a row, titles that shift 4px, images that
breathe inside their frame, underlines that sweep. Handing these to JS would
have bought nothing.

### Why the hero entrance is *not* in GSAP

Animating the headline from GSAP cost **8 Lighthouse points and about a second
of LCP**. The hero headline is the Largest Contentful Paint on nearly every
page here, and it was sitting invisible until a 47 KB chunk downloaded and
parsed. The hero now animates from a CSS keyframe that runs at first paint,
using `clip-path` rather than `overflow: hidden` — the inset animates past zero
to a negative value, so the mask clears the descenders on headings set at
line-height 1.03 instead of shearing them off.

GSAP earns its weight on scroll work CSS genuinely cannot do. It does not
belong on the critical path.

### Failure modes, covered

| If | Then |
|---|---|
| `prefers-reduced-motion: reduce` | Every animation off, finished state shown |
| Page loads in a background tab | Reveals skip to the finished state instead of freezing half-played |
| The motion chunk never arrives | A timer in `<head>` forces every hidden element visible after 2.5s |
| A client-side route change | `gsap.context().revert()` + every ScrollTrigger killed before the DOM swaps |

## Deliberately absent

- **Framer Motion** — it requires React. This site ships no framework JS at
  all; adding React for animation would cost more than everything else on the
  page combined and does nothing GSAP does not already do.
- **Drag and drop** — there is nothing on a reading site a person would want to
  drag.
- **Glassmorphism, except in one place** — the sticky header, and only once it
  has scrolled. That is Apple's own rule, and the reason it reads as chrome
  floating over content. Frosted cards would put the site straight back into
  the look this redesign existed to leave.
- **A second accent, gradients, shadows, rounded corners.**

## Measured

Local Lighthouse (`npm run perf`), all four page types:

| | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Homepage | 98 | 100 | 100 | 100 | 2.3s | 0 | 0ms |
| Blog index | 95 | 100 | 100 | 100 | 2.9s | 0 | 0ms |
| A post | 97 | 100 | 100 | 100 | 2.4s | 0 | 0ms |
| About | 95 | 100 | 100 | 100 | 2.9s | 0 | 0ms |

Verified at 390 / 768 / 1440 px in both themes: no horizontal overflow, the
mobile menu opens and closes on navigation, and a client-side route change
re-boots motion with no leaked ScrollTriggers.

### Two defects the measuring found

1. **The perf harness was lying.** It served everything uncompressed, so it
   read the blog index as a 159 KB document instead of the 15 KB Cloudflare
   actually sends, and scored the site ~14 points below what it deserved.
   `scripts/perf.mjs` now gzips like production.
2. **`fonts.css` was render-blocking** — a whole round trip in front of LCP,
   for 722 bytes. Inlined into `<head>`.

And one thing that seemed obviously right and was not: `fetchpriority="high"`
on list thumbnails made the blog index **worse** (96 → 92). They are 11rem
wide and were never the LCP element, so promoting them only stole bandwidth
from the font. Measured, reverted.

## Bugs fixed along the way

- **Newsletter CTA was invisible.** With no signup provider configured, the
  fallback rendered as white text on no background — unreadable in light mode.
- **Counters froze part-way** ("4" instead of "40"). `requestAnimationFrame` is
  throttled in unfocused tabs; the old failsafe only fired if the value was
  still exactly `0`.
- **Parallax, tilt and the magnetic CTA were lost permanently** on any page
  opened in a background tab — they shared the reveals' visibility guard, and
  `boot()` only runs once per load.
- **The blurred halo behind the About portrait** is gone, and the portrait is
  squared off and ruled like every other image on the site.

## References

`.design-refs/` holds the DESIGN.md files this was built against — Apple,
Linear, Stripe, Vercel, The Verge, Wired, Framer — from `awesome-design-md`
(VoltAgent, MIT). Two conclusions from them shaped the work most: *"The Verge
uses zero decorative gradients"*, and Linear's rule that on dark grounds depth
comes from **luminance steps and whisper-thin borders**, never from shadow.
