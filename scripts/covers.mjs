/* Authored article covers.
 *
 *   node scripts/covers.mjs
 *
 * Replaces 41 stock photographs of strangers with a generated family of
 * hairline marks in the site's own palette.
 *
 * Why SVG rather than a generated raster: the site's visual language IS
 * hairline geometry, which is what SVG draws natively. Each cover is ~1-2 KB
 * instead of ~24 KB, stays sharp at any size, and uses the exact hex values
 * rather than an approximation. The whole set weighs less than two of the
 * photographs it replaces.
 *
 * The motif family comes from the post's TOPIC, so a topic page reads as a
 * set. The arrangement comes from a hash of the slug, so no two posts share a
 * mark. Deterministic: the same post always produces the same cover.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = path.join(ROOT, "src", "content", "posts");
const OUT = path.join(ROOT, "public", "images", "covers");

const W = 1200, H = 750;               // 16:10, matches the listing aspect
const PAPER = "#F4F3EF";
const INK = "#17180F";
const AMBER = "#8A5A12";
const HAIR = "#D4D0C6";

/* A small deterministic PRNG so a slug always yields the same composition. */
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6d2b79f5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const between = (r, a, b) => a + r() * (b - a);

/* ---- motif families, one per topic -------------------------------------
   STROKE WEIGHTS ARE SET FOR THE DISPLAYED SIZE, NOT THE ARTBOARD.
   These render at ~176px wide in the blog listing — a 6.8x downscale from the
   1200px viewBox. A 1.25px stroke would become 0.18px and vanish. Structure is
   therefore drawn at 9-16px so it reads as a hairline where it is actually
   seen. Verified by rendering a contact sheet at listing size.

   Each family varies count, scale, rotation AND density from the seed, so two
   posts in the same topic do not look like the same picture. */

const S_MAIN = 11, S_HOT = 22;

const M = {
  // signal fanning out from a source
  "Digital Marketing"(r) {
    const cx = between(r, 120, 300), cy = H / 2;
    const n = 5 + Math.floor(r() * 3), hot = Math.floor(between(r, 1, n));
    const step = between(r, 95, 135);
    return Array.from({ length: n }, (_, i) => {
      const rad = 130 + i * step;
      return `<path d="M ${cx} ${cy - rad} A ${rad} ${rad} 0 0 1 ${cx} ${cy + rad}"
        fill="none" stroke="${i === hot ? AMBER : INK}"
        stroke-width="${i === hot ? S_HOT : S_MAIN}" stroke-linecap="round"/>`;
    }).join("");
  },

  // a value travelling a chain of nodes, broken at one of them
  "Performance & Affiliate"(r) {
    const n = 4 + Math.floor(r() * 3);
    const box = between(r, 62, 104);
    const gap = (W - 300) / (n - 1);
    const y = H / 2 + between(r, -70, 70);
    const brk = 1 + Math.floor(r() * (n - 2));
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = 150 + i * gap, on = i === brk;
      s += `<rect x="${x - box / 2}" y="${y - box / 2}" width="${box}" height="${box}"
        fill="${on ? AMBER : "none"}" stroke="${on ? AMBER : INK}" stroke-width="${S_MAIN}"/>`;
      if (i < n - 1) {
        const x2 = i === brk - 1 ? x + gap * 0.42 : x + gap - box / 2;
        s += `<line x1="${x + box / 2}" y1="${y}" x2="${x2}" y2="${y}"
          stroke="${INK}" stroke-width="${S_MAIN}" stroke-linecap="round"/>`;
      }
    }
    return s;
  },

  // concentric frames — something built outward from a centre
  "Brand Building"(r) {
    const cx = W / 2, cy = H / 2;
    const n = 3 + Math.floor(r() * 3), hot = Math.floor(r() * n);
    const step = between(r, 80, 115), rot = between(r, -8, 8);
    return Array.from({ length: n }, (_, i) => {
      const d = 95 + i * step;
      return `<rect x="${cx - d}" y="${cy - d * 0.72}" width="${d * 2}" height="${d * 1.44}"
        fill="none" stroke="${i === hot ? AMBER : INK}"
        stroke-width="${i === hot ? S_HOT : S_MAIN}"
        transform="rotate(${rot * (i / n)} ${cx} ${cy})"/>`;
    }).join("");
  },

  // a ledger of columns, one carrying the weight
  "Business & Finance"(r) {
    const base = H - 150, n = 4 + Math.floor(r() * 4);
    const gap = (W - 300) / n, bw = gap * between(r, 0.42, 0.62);
    const hot = Math.floor(between(r, 0, n));
    let s = `<line x1="110" y1="${base}" x2="${W - 110}" y2="${base}" stroke="${INK}" stroke-width="${S_MAIN}"/>`;
    for (let i = 0; i < n; i++) {
      const x = 175 + i * gap, h = between(r, 110, 430);
      s += `<rect x="${x - bw / 2}" y="${base - h}" width="${bw}" height="${h}"
        fill="${i === hot ? AMBER : "none"}" stroke="${i === hot ? AMBER : INK}" stroke-width="${S_MAIN}"/>`;
    }
    return s;
  },

  // a lattice with one live cell
  "AI & Automation"(r) {
    const cols = 4 + Math.floor(r() * 4), rows = 3 + Math.floor(r() * 2);
    const gx = (W - 320) / (cols - 1), gy = (H - 260) / (rows - 1);
    const hx = Math.floor(r() * cols), hy = Math.floor(r() * rows);
    const d = between(r, 46, 78);
    let s = "";
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const cx = 160 + x * gx, cy = 130 + y * gy, on = x === hx && y === hy;
      s += on
        ? `<rect x="${cx - d / 2}" y="${cy - d / 2}" width="${d}" height="${d}" fill="${AMBER}"/>`
        : `<rect x="${cx - d / 2}" y="${cy - d / 2}" width="${d}" height="${d}" fill="none" stroke="${INK}" stroke-width="${S_MAIN}"/>`;
    }
    return s;
  },

  // steps that do not rise evenly — the shape of learning something
  "Founder Lessons"(r) {
    const n = 3 + Math.floor(r() * 3), w = (W - 260) / n;
    const base = H - 170, hot = Math.floor(between(r, 0, n));
    let s = "", y = base;
    for (let i = 0; i < n; i++) {
      const rise = between(r, 70, 150) * (r() > 0.25 ? 1 : -0.6);
      const x = 130 + i * w, ny = Math.max(120, Math.min(H - 120, y - rise));
      s += `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}"
        stroke="${i === hot ? AMBER : INK}" stroke-width="${i === hot ? S_HOT : S_MAIN}" stroke-linecap="square"/>`;
      if (i < n - 1)
        s += `<line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${ny}" stroke="${INK}" stroke-width="${S_MAIN}"/>`;
      y = ny;
    }
    return s;
  },

  // rules crossing — where two things meet
  Business(r) {
    const n = 2 + Math.floor(r() * 3);
    let s = "";
    for (let i = 0; i < n; i++) {
      const y = 150 + (i + 0.5) * ((H - 300) / n) + between(r, -40, 40);
      s += `<line x1="110" y1="${y}" x2="${W - 110}" y2="${y}" stroke="${INK}" stroke-width="${S_MAIN}"/>`;
    }
    const vx = between(r, 300, W - 300);
    s += `<line x1="${vx}" y1="100" x2="${vx}" y2="${H - 100}" stroke="${AMBER}" stroke-width="${S_HOT}"/>`;
    return s;
  },
};

const cover = (topic, slug) => {
  const r = rng(slug);
  const draw = M[topic] ?? M.Business;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<rect width="${W}" height="${H}" fill="${PAPER}"/>
${draw(r)}
<line x1="0" y1="${H - 1}" x2="${W}" y2="${H - 1}" stroke="${INK}" stroke-width="10"/>
</svg>`.replace(/\n\s+/g, "\n");
};

/* ------------------------------------------------------------------ run */

fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(POSTS).filter((f) => /\.mdx?$/.test(f));
let written = 0, bytes = 0;
const map = [];

for (const f of files) {
  const raw = fs.readFileSync(path.join(POSTS, f), "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  const get = (k) => (fm[1].match(new RegExp(`^${k}:\\s*(.*)$`, "m")) ?? [])[1]?.trim().replace(/^["']|["']$/g, "");
  const slug = get("slug") ?? f.replace(/\.mdx?$/, "");
  const topic = get("category") ?? "Business";
  if (slug === "privacy-policy") continue;

  const svg = cover(topic, slug);
  const dest = path.join(OUT, `${slug}.svg`);
  fs.writeFileSync(dest, svg);
  written++; bytes += Buffer.byteLength(svg);
  map.push({ file: f, slug, topic });
}

console.log(`  ${written} covers · ${(bytes / 1024).toFixed(1)} KB total · avg ${Math.round(bytes / written)} B`);
fs.writeFileSync(path.join(OUT, ".map.json"), JSON.stringify(map, null, 2));
