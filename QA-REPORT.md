# QA pass — 3 Aug 2026

Tested against **live** `www.prabhashjha.com` at 1440×900 and 390×844, both
colour schemes. 62 built pages scanned statically; 9 page types driven
interactively.

## Bugs found

### 1 · Search input: the icon sits on top of the first character — HIGH
**Desktop + mobile, both themes.** Typing `affiliate` renders as `⌕ffiliate`.

`.pagefind-ui__form::before` is absolutely positioned at `left: 16px` with
`width: 14.4px`, so it occupies 16–30.4px. `search.astro` sets the input to
`padding: 1rem 1.1rem` — a left pad of **17.6px**. Text starts underneath the
icon. Affects the site's only search field, on first keystroke.

### 2 · Hero entrance stagger does not stagger — MEDIUM
**Every page.** The CSS steps hero elements with `:nth-of-type(1..3)`, but the
hero's children are *different element types* (`p`, `p`, `div`, `dl`), and
`nth-of-type` counts per type. Measured delays on the homepage:

| Element | Intended | Actual |
|---|---|---|
| `p.reveal.label` (eyebrow) | 0.28s | 0.28s |
| `p.reveal` (standfirst) | 0.36s | 0.36s |
| `div.reveal` (CTA row) | 0.44s | **0.28s** |
| `dl.reveal` (colophon) | 0.52s | **0.28s** |

Three of four elements fire simultaneously. The sequence I built does not
actually run.

### 3 · No skip link — MEDIUM-HIGH (WCAG 2.4.1, Level A)
There is no bypass mechanism. A keyboard or screen-reader user tabs through
the logo, four nav links and the search button before reaching content — on
every page, every navigation. First focusable element is the logo.

### 4 · Light theme: label text fails AA on raised surfaces — MEDIUM
`--color-dim` `#6B6C61` on `--color-surface` `#EDEBE5` = **4.47:1**, against a
4.5:1 requirement. Affects every `.label` on the footer and on hovered list
rows. Dark theme passes at 4.98:1.

### 5 · Nav links are 23px tall — LOW-MEDIUM (WCAG 2.5.8, Level AA)
`Topics` 41×23, `About` 39×23, `Work With Me` 93×23, `Newsletter` 67×23,
`All posts →` 89×22 — all under the 24×24 minimum. The link text is the whole
target; there is no padding to grow it.

### 6 · Both `<nav>` landmarks are unnamed — LOW
The desktop nav and the mobile nav have no `aria-label`, so a screen reader
announces two indistinguishable "navigation" landmarks. (Breadcrumb navs on
post and category pages *are* labelled.)

### 7 · Decorative progress bar is exposed to assistive tech — LOW
`#progress` has no `aria-hidden`, so it appears in the accessibility tree as an
unlabelled element conveying nothing.

### 8 · Two meta descriptions exceed the truncation limit — LOW-MEDIUM (SEO)
Homepage **210 chars**, `/about/` **183**. Google truncates near 160.

### 9 · 18 post titles exceed 65 characters — LOW (content, pre-existing)
Longest is 82. `scripts/check-posts.mjs` already warns on these at build time;
they are editorial decisions, not defects, so they are listed but not changed.

## Checked and found correct

Worth recording, because two of these looked like bugs until measured:

- **Focus ring colour.** Initially read as `rgb(85,86,76)` (muted) rather than
  the accent. It is correct — `.transition-colors` includes `outline-color`,
  and the automation pane's throttled rAF had frozen the transition at its
  start value. With transitions disabled it resolves to `rgb(138,90,18)`.
- **Pagefind in dark theme.** The stock Pagefind variables are still at their
  defaults (`#ffffff` background, `#393939` text, 8px radius), which looked
  alarming — but `search.astro` overrides them with direct selectors, and dark
  theme renders correctly.
- **Redirects.** `/privacy`, `/blog/categories/marketing`, the three old Wix
  post URLs — all real edge **301s**, not the meta-refresh fallback stubs.
- **Canonicalisation.** Apex 301s to `www`; canonical, `robots.txt` and sitemap
  all agree on `www`.
- **No horizontal overflow** at 390px on any of the 9 page types.
- **No broken images** (0 of 60 across all pages), no broken internal links, no
  missing assets, no duplicate `id`s, no `target="_blank"` without `noopener`,
  no links without an accessible name.
- **Search returns correct results** — "affiliate tracking" → 7 results, right
  order, working hrefs.
- **Mobile menu** opens, closes on navigation, and does not stack listeners.
- **Lenis** is active at 1440px and correctly absent at 390px.
- **Client-side navigation** from 2000px scroll lands the next page at 0 with
  motion re-booted and no leaked ScrollTriggers.
