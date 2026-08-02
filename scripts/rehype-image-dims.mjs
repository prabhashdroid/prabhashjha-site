/* Adds width/height (and lazy loading) to every image written inside a post.

   Markdown images — ![alt](/images/posts/x.webp) — carry no dimensions, so the
   browser cannot reserve space for them and the text jumps as they load. That
   is Cumulative Layout Shift, and Google measures it.

   This reads the real pixel size out of each file at build time, so nobody has
   to record dimensions by hand when uploading through the admin. */
import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";

const cache = new Map();

function readDims(buf) {
  // PNG
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47)
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };

  // GIF
  if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF")
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };

  // WebP
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

  // JPEG
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let o = 2;
    while (o < buf.length - 9) {
      if (buf[o] !== 0xff) { o++; continue; }
      const m = buf[o + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { w: buf.readUInt16BE(o + 7), h: buf.readUInt16BE(o + 5) };
      o += 2 + buf.readUInt16BE(o + 2);
    }
  }
  return null;
}

function dims(src) {
  if (cache.has(src)) return cache.get(src);
  let out = null;
  try {
    const file = path.join(process.cwd(), "public", decodeURIComponent(src).replace(/^\//, ""));
    out = readDims(fs.readFileSync(file).subarray(0, 65536));
  } catch {
    out = null;
  }
  cache.set(src, out);
  return out;
}

export default function rehypeImageDims() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      const p = node.properties ?? (node.properties = {});
      const src = typeof p.src === "string" ? p.src : "";
      if (!src.startsWith("/")) return;
      if (!p.loading) p.loading = "lazy";
      if (!p.decoding) p.decoding = "async";
      if (p.width && p.height) return;
      const d = dims(src);
      if (d) {
        p.width = d.w;
        p.height = d.h;
      }
    });
  };
}
