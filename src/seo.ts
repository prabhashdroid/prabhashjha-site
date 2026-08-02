/* ============================================================
   Automatic SEO safety net.

   Everything here runs at BUILD time so that a post written in the
   admin — by anyone, with no technical knowledge — still comes out
   correct for Google and for AI answer engines.

   Nobody has to remember to do any of this by hand.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";

/* ---------- 1. Image dimensions ------------------------------
   Images uploaded through the admin have no width/height recorded,
   which brings back layout shift (a Core Web Vitals penalty).
   We read the real pixel size straight out of the file header at
   build time — no dependency, no manual step.
-------------------------------------------------------------- */
const dimCache = new Map<string, { w: number; h: number } | null>();

function readDims(buf: Buffer): { w: number; h: number } | null {
  // PNG
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47)
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };

  // GIF
  if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF")
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };

  // WebP (VP8 / VP8L / VP8X)
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const c = buf.toString("ascii", 12, 16);
    if (c === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (c === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
    if (c === "VP8X")
      return {
        w: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
        h: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
      };
  }

  // JPEG — walk the segment markers to the start-of-frame
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let o = 2;
    while (o < buf.length - 9) {
      if (buf[o] !== 0xff) { o++; continue; }
      const m = buf[o + 1];
      // SOF0..SOF15, skipping the non-frame markers in that range
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { w: buf.readUInt16BE(o + 7), h: buf.readUInt16BE(o + 5) };
      o += 2 + buf.readUInt16BE(o + 2);
    }
  }
  return null;
}

/** Real pixel size of a site-root image path such as `/images/posts/x.jpg`. */
export function imageDims(src?: string): { w: number; h: number } | null {
  if (!src || !src.startsWith("/")) return null;
  if (dimCache.has(src)) return dimCache.get(src)!;
  let out: { w: number; h: number } | null = null;
  try {
    const file = path.join(process.cwd(), "public", decodeURIComponent(src).replace(/^\//, ""));
    out = readDims(fs.readFileSync(file).subarray(0, 65536));
  } catch {
    out = null;
  }
  dimCache.set(src, out);
  return out;
}

/** width/height to put on an <img>, preferring frontmatter, then the file itself. */
export function coverSize(data: { cover?: string; coverW?: number; coverH?: number }) {
  if (data.coverW && data.coverH) return { width: data.coverW, height: data.coverH };
  const d = imageDims(data.cover);
  return d ? { width: d.w, height: d.h } : { width: 1600, height: 900 };
}

/* ---------- 2. Meta description ------------------------------
   Google truncates around 160 characters, and an empty description
   is worse than a short one. So: use what was written, trim it at a
   sentence or word boundary, and if it is missing entirely, build
   one from the opening of the post.
-------------------------------------------------------------- */
export function metaDescription(desc: string | undefined, body?: string, limit = 158): string {
  let t = (desc ?? "").trim();

  if (!t && body) {
    t = body
      .replace(/^---[\s\S]*?---/, "")           // frontmatter
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")     // images
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links -> text
      .replace(/[#>*_`|-]/g, " ")               // markdown punctuation
      .replace(/\s+/g, " ")
      .trim();
  }
  if (t.length <= limit) return t;

  const cut = t.slice(0, limit);
  const sentence = cut.match(/^(.*[.!?])\s/);
  if (sentence && sentence[1].length > 70) return sentence[1];
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—-]+$/, "") + "…";
}

/* ---------- 3. FAQ extraction ---------------------------------
   Most posts end with an FAQ section. Marked up as FAQPage schema,
   those answers become eligible for Google's rich results and are
   what AI assistants quote when someone asks the question directly.

   Extracted automatically from the markdown — you just write the
   FAQ section as normal headings and answers.
-------------------------------------------------------------- */
export type Faq = { q: string; a: string };

export function extractFaqs(body?: string): Faq[] {
  if (!body) return [];
  const start = body.match(/^##\s+(FAQs?|Frequently Asked[^\n]*)\s*$/im);
  if (!start || start.index === undefined) return [];

  // everything from the FAQ heading to the next H2 (or the end)
  const after = body.slice(start.index + start[0].length);
  const next = after.search(/^##\s+/m);
  const section = next === -1 ? after : after.slice(0, next);

  const out: Faq[] = [];
  const parts = section.split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    if (nl === -1) continue;
    const q = part.slice(0, nl).trim();
    const a = part
      .slice(nl)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`>#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (q.length > 5 && a.length > 20) out.push({ q, a: a.slice(0, 900) });
  }
  return out;
}
