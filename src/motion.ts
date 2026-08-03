/* Motion system — GSAP + ScrollTrigger.
 *
 * Rules this file holds itself to, from the official GSAP performance skill:
 *   · transform and opacity only, so every frame stays on the compositor
 *   · will-change is set on the handful of elements that actually animate,
 *     and removed the moment they finish
 *   · lists use ScrollTrigger.batch(), never one trigger per item with a
 *     hand-rolled delay
 *   · everything is created inside a gsap.context() and reverted before an
 *     Astro view transition swaps the DOM, so nothing leaks between pages
 *   · prefers-reduced-motion turns all of it off and shows the finished state
 *
 * What is deliberately NOT here: the hero entrance. Everything in the first
 * viewport is animated from global.css instead. The hero headline is the
 * Largest Contentful Paint on nearly every page, and gating it on this chunk
 * downloading and parsing cost about a second of LCP and eight Lighthouse
 * points — measured, not assumed. GSAP earns its weight on scroll work that
 * CSS genuinely cannot do; it should not sit on the critical path.
 *
 * The failure mode that matters: .reveal elements start at opacity 0 in CSS to
 * avoid a flash of unstyled content. If this module never runs — a chunk that
 * 404s, a browser that chokes — the page below the fold would be blank.
 * Base.astro therefore arms a timer that forces everything visible unless this
 * file reports in.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* One shared easing vocabulary. Two registers, deliberately:
   EASE_OUT for things arriving, EASE_SOFT for things responding to a pointer. */
const EASE_OUT = "power3.out";
const EASE_SOFT = "power2.out";

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let ctx: gsap.Context | null = null;

/* ---------------------------------------------------------------- helpers */

/** The finished state, with no animation. Reduced motion and every failsafe. */
function showEverything() {
  document.querySelectorAll<HTMLElement>(".reveal, .reveal-scale").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

/* ------------------------------------------------------------------ boot */

export function boot() {
  document.documentElement.dataset.motion = "on";
  initNav();
  initCounters();

  ctx?.revert();
  ctx = gsap.context(() => {
    initHeader();
    initProgress();

    /* Parallax and tilt are desktop-and-mouse only. On a phone the scroll is
       already the interaction, and a scrubbed transform there costs frames
       without adding anything.

       These are set up regardless of tab visibility — unlike an entrance
       animation, they are driven by scroll and pointer, so they simply do not
       run until someone is actually looking at the page. Gating them on
       visibility at load meant a page opened in a background tab lost them
       permanently, because boot() only runs once. */
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => initParallax());
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      initTilt();
      initMagnetic();
    });

    /* Reveals are the exception: a page that loads in a background tab gets no
       requestAnimationFrame, so a reveal would sit frozen half-played until the
       tab is focused. Skip straight to the finished state instead. */
    if (still() || document.visibilityState !== "visible") {
      showEverything();
      return;
    }
    initReveals();
  });
}

/* --------------------------------------------------------------- reveals */

/** Everything below the hero, batched so a row of four animates as one group. */
function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>(".reveal, .reveal-scale")
    .filter((el) => !el.closest("[data-hero]"));
  if (!items.length) return;

  ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: EASE_OUT,
        stagger: 0.075,
        overwrite: true,
      }),
  });

  /* Anything already on screen at load should not wait for a scroll that may
     never come — batch only fires on entry. */
  ScrollTrigger.refresh();
}

/* -------------------------------------------------------------- parallax */

/**
 * Images drift against the scroll inside a fixed frame. The image is scaled up
 * first so the drift can never expose an edge, and the frame's own box never
 * moves — so this adds exactly zero layout shift.
 */
function initParallax() {
  const frames = gsap.utils.toArray<HTMLElement>("[data-parallax]");
  frames.forEach((frame) => {
    const img = frame.querySelector<HTMLElement>("img");
    if (!img) return;
    gsap.set(img, { scale: 1.14, willChange: "transform" });
    gsap.fromTo(
      img,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: frame,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      }
    );
  });
}

/* ------------------------------------------------------------------ tilt */

/**
 * A three-degree tilt. Enough that the lead image feels like an object with a
 * near and a far edge; not enough to read as a gimmick.
 */
function initTilt() {
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: EASE_SOFT });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: EASE_SOFT });
    gsap.set(el, { transformPerspective: 900, transformOrigin: "center" });

    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      rx(gsap.utils.clamp(-3, 3, ((e.clientY - r.top) / r.height - 0.5) * -6));
      ry(gsap.utils.clamp(-3, 3, ((e.clientX - r.left) / r.width - 0.5) * 6));
    });
    el.addEventListener("pointerleave", () => { rx(0); ry(0); });
  });
}

/* -------------------------------------------------------------- magnetic */

/** The primary call to action leans toward the cursor. 6px, no more. */
function initMagnetic() {
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: EASE_SOFT });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: EASE_SOFT });

    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo(gsap.utils.clamp(-6, 6, (e.clientX - (r.left + r.width / 2)) * 0.28));
      yTo(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.28));
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

/* -------------------------------------------------------------- chrome */

/** Reading progress, driven by ScrollTrigger rather than a scroll listener. */
function initProgress() {
  const bar = document.getElementById("progress");
  if (!bar) return;
  gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
  });
}

/**
 * The sticky header goes to glass once the page has moved. This is the one
 * place on the site that uses a backdrop blur — Apple's own rule, and the
 * reason it reads as chrome floating over content rather than as decoration.
 */
function initHeader() {
  const h = document.getElementById("siteHeader");
  const inner = document.getElementById("headerInner");
  if (!h || !inner) return;
  ScrollTrigger.create({
    start: 8,
    end: "max",
    onToggle: (self) => {
      h.classList.toggle("is-stuck", self.isActive);
      inner.classList.toggle("h-[74px]", !self.isActive);
      inner.classList.toggle("h-[58px]", self.isActive);
    },
  });
}

/* ----------------------------------------------------------------- nav */

function initNav() {
  const b = document.getElementById("navToggle");
  const p = document.getElementById("mobileNav");
  if (!b || !p) return;

  const close = () => {
    p.classList.add("hidden");
    b.setAttribute("aria-expanded", "false");
  };

  // The header is transition:persist, so it survives client-side navigation —
  // and so did the OPEN menu. Close it on every page load.
  close();

  // Same reason: this runs on every navigation but the button element
  // persists. Without the guard we stack a listener each time, so after three
  // navigations one tap toggles three times.
  if (b.dataset.wired) return;
  b.dataset.wired = "1";

  b.addEventListener("click", () => {
    const closed = p.classList.toggle("hidden");
    b.setAttribute("aria-expanded", String(!closed));
    if (!closed && !still()) {
      // overwrite, so opening twice in quick succession can't leave a link
      // stranded between two competing tweens.
      gsap.from(p.querySelectorAll("a"), {
        opacity: 0, y: 10, duration: 0.35, stagger: 0.045, ease: EASE_OUT, overwrite: true,
      });
    }
  });
  p.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  window.addEventListener("resize", () => { if (window.innerWidth >= 768) close(); });
}

/* ------------------------------------------------------------- counters */

function initCounters() {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    if (el.dataset.counted === "1") return;
    el.dataset.counted = "1";
    const target = parseFloat(el.dataset.count || "0");
    const final = () => { el.textContent = target.toLocaleString(); };
    if (still()) { final(); return; }

    const n = { v: 0 };
    gsap.to(n, {
      v: target,
      duration: 1.2,
      ease: EASE_OUT,
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: () => { el.textContent = Math.round(n.v).toLocaleString(); },
      onComplete: final,
    });
    // Belt and braces: if the trigger never fires (background tab, starved
    // rAF), the real number still lands.
    setTimeout(() => { if (el.textContent === "0") final(); }, 4000);
  });
}

/* ------------------------------------------------ astro view transitions */

boot();
document.addEventListener("astro:page-load", boot);

/* Kill every trigger before the DOM is swapped. Left alive they keep measuring
   elements that no longer exist, which is the classic ScrollTrigger leak. */
document.addEventListener("astro:before-swap", () => {
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
