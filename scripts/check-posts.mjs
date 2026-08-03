/* Publishing guard — runs as part of `npm run build`.
 *
 * A post without a cover image ships with no thumbnail on the homepage, no
 * card on the topic page, and no image in link previews when it's shared.
 * That has to be caught at build time, not by someone noticing later.
 *
 * FAILS THE BUILD on anything in ERRORS. Warns on the rest.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = "src/content/posts";
const PUB = "public";

const AFFILIATE_DOMAINS = (() => {
  try {
    const site = JSON.parse(fs.readFileSync("src/data/site.json", "utf8"));
    return (site?.monetisation?.affiliateDomains ?? []).map((d) =>
      String(d).toLowerCase().replace(/^www\./, "")
    );
  } catch {
    return [];
  }
})();

const errors = [];
const warnings = [];

// privacy-policy is excluded from every listing and feed, so a cover would
// never be shown — it is the one legitimate exemption.
const EXEMPT = new Set(["privacy-policy"]);
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { errors.push(`${f}: no frontmatter`); continue; }
  const front = fm[1];
  const body = raw.slice(fm[0].length);
  const get = (k) => (front.match(new RegExp(`^${k}:\\s*(.*)$`, "m")) ?? [])[1]?.trim().replace(/^["']|["']$/g, "");

  const title = get("title");
  const cover = get("cover");
  const slug = get("slug") ?? f.replace(/\.mdx?$/, "");
  const label = `${slug}`;

  // --- cover image is mandatory ---
  if (!cover && !EXEMPT.has(slug)) {
    errors.push(`${label}: NO COVER IMAGE. Every post needs one — it's the thumbnail on the homepage, the topic page card, and the link preview when shared.`);
  } else if (cover && cover.startsWith("/")) {
    const onDisk = path.join(PUB, decodeURIComponent(cover).replace(/^\//, ""));
    if (!fs.existsSync(onDisk)) errors.push(`${label}: cover file missing on disk → ${cover}`);
  }

  // --- commercial links must be disclosed ---
  // Amazon Associates and most networks terminate for a missing disclosure,
  // and that termination is usually permanent. Too expensive to be a warning.
  if (AFFILIATE_DOMAINS.length) {
    const hits = new Set();
    for (const m of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      let host;
      try { host = new URL(m[1]).hostname.toLowerCase().replace(/^www\./, ""); } catch { continue; }
      if (AFFILIATE_DOMAINS.some((d) => host === d || host.endsWith("." + d))) hits.add(host);
    }
    const declared = /^affiliate:\s*true\s*$/m.test(front);
    if (hits.size && !declared)
      errors.push(
        `${label}: links to ${[...hits].join(", ")} but has no \`affiliate: true\` — ` +
          `the FTC disclosure will not render, which breaches affiliate terms.`
      );
    if (declared && !hits.size)
      warnings.push(`${label}: affiliate: true but no link to a configured affiliate domain`);
  }

  // --- every local asset the body links to must exist ---
  for (const m of body.matchAll(/!?\[[^\]]*\]\((\/[^)\s]+)\)/g)) {
    const p = path.join(PUB, decodeURIComponent(m[1]).replace(/^\//, ""));
    const isPage = !path.extname(m[1]);
    if (!isPage && !fs.existsSync(p)) errors.push(`${label}: linked file missing → ${m[1]}`);
  }

  // --- quality warnings, not blockers ---
  if (!title) errors.push(`${label}: no title`);
  // The headline may run as long as it needs to. What Google truncates is the
  // <title>, which is `seoTitle` when one is set — so that is what gets checked.
  const seo = get("seoTitle") || title;
  if (seo && seo.length > 62)
    warnings.push(
      `${label}: Google title ${seo.length} chars (truncates ~60)` +
        (get("seoTitle") ? "" : " — add a shorter `seoTitle:` to fix without changing the headline")
    );
  const desc = get("description");
  if (!desc) warnings.push(`${label}: no description — one will be auto-generated from the opening`);
  else if (desc.length > 165) warnings.push(`${label}: description ${desc.length} chars (Google truncates ~160)`);
  if (!/^##\s+(FAQs?|Frequently Asked)/im.test(body))
    warnings.push(`${label}: no FAQ section — misses FAQ rich results and AI direct-answer citations`);
  // no in-article image is a warning: the cover already guarantees a thumbnail
  if (cover && !/!\[[^\]]*\]\(/.test(body))
    warnings.push(`${label}: cover set but no image inside the article`);
}

const n = files.length;
if (warnings.length) {
  console.log(`\n  \x1b[33m${warnings.length} warning(s)\x1b[0m across ${n} posts:`);
  warnings.slice(0, 12).forEach((w) => console.log("    · " + w));
  if (warnings.length > 12) console.log(`    … and ${warnings.length - 12} more`);
}
if (errors.length) {
  console.error(`\n  \x1b[31mBUILD BLOCKED — ${errors.length} problem(s):\x1b[0m`);
  errors.forEach((e) => console.error("    ✗ " + e));
  console.error("");
  process.exit(1);
}
console.log(`\n  \x1b[32m✓ ${n} posts: all have covers, all linked files exist.\x1b[0m`);
