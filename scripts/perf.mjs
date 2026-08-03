/* Performance check — the local equivalent of Wix's site-speed dashboard.
 *
 *   npm run perf
 *
 * Builds nothing; it serves ./dist and runs Lighthouse against a
 * representative page of each type, then prints scores and the Core Web
 * Vitals Google actually ranks on. Fails with a non-zero exit code if any
 * score drops below the thresholds set in BUDGET, so a slow change gets
 * caught before it ships rather than months later in Search Console.
 *
 * Runs entirely on this machine. No account, no subscription, no data
 * leaves the laptop.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const PORT = 4399;
const ROOT = path.join(process.cwd(), "dist");

// Minimum acceptable scores (0-100). Tightened deliberately: a static site
// with no third-party scripts should have no excuse for missing these.
const BUDGET = { performance: 95, accessibility: 95, "best-practices": 95, seo: 100 };

const PAGES = [
  ["homepage", "/"],
  ["blog index", "/blog/"],
  ["a post", "/post/cash-flow-vs-profit-the-difference-that-sinks-most-small-businesses/"],
  ["about", "/about/"],
];

const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2",
  ".xml": "application/xml", ".txt": "text/plain", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      let file = path.join(ROOT, p);
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      if (!fs.existsSync(file)) {
        file = path.join(ROOT, "404.html");
        if (!fs.existsSync(file)) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(404, { "Content-Type": "text/html" });
        return res.end(fs.readFileSync(file));
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
      res.end(fs.readFileSync(file));
    });
    server.listen(PORT, () => resolve(server));
  });
}

const run = (url) =>
  new Promise((resolve, reject) => {
    const out = [];
    const cp = spawn(
      process.execPath,
      [
        path.join("node_modules", "lighthouse", "cli", "index.js"),
        url, "--output=json", "--quiet",
        "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
        "--only-categories=performance,accessibility,best-practices,seo",
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );
    cp.stdout.on("data", (d) => out.push(d));
    cp.on("close", (code) => {
      if (code !== 0) return reject(new Error("lighthouse exited " + code));
      try { resolve(JSON.parse(Buffer.concat(out).toString())); }
      catch (e) { reject(e); }
    });
  });

const pad = (s, n) => String(s).padEnd(n);
const colour = (v, min) => (v >= min ? "\x1b[32m" : v >= min - 10 ? "\x1b[33m" : "\x1b[31m") + String(v).padStart(3) + "\x1b[0m";

const server = await serve();
console.log(`\n  Serving dist/ on :${PORT} — running Lighthouse on ${PAGES.length} pages\n`);
console.log("  " + pad("PAGE", 14) + " PERF  A11Y  BEST   SEO   LCP      CLS     TBT");
console.log("  " + "-".repeat(66));

let failed = [];
const rows = [];
for (const [name, url] of PAGES) {
  const r = await run(`http://localhost:${PORT}${url}`);
  const s = Object.fromEntries(
    Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)])
  );
  const a = r.audits;
  const lcp = a["largest-contentful-paint"].displayValue ?? "-";
  const cls = a["cumulative-layout-shift"].displayValue ?? "-";
  const tbt = a["total-blocking-time"].displayValue ?? "-";
  rows.push({ name, s, lcp, cls, tbt, audits: a });
  console.log(
    "  " + pad(name, 14) +
    ` ${colour(s.performance, BUDGET.performance)}   ${colour(s.accessibility, BUDGET.accessibility)}   ` +
    `${colour(s["best-practices"], BUDGET["best-practices"])}   ${colour(s.seo, BUDGET.seo)}   ` +
    pad(lcp, 8) + " " + pad(cls, 7) + " " + tbt
  );
  for (const [k, min] of Object.entries(BUDGET)) {
    if (s[k] < min) failed.push(`${name}: ${k} ${s[k]} < ${min}`);
  }
}

// Show what actually cost points, so a regression is actionable.
const problems = new Map();
for (const { name, audits } of rows) {
  for (const [id, a] of Object.entries(audits)) {
    if (a.score !== null && a.score < 0.9 && a.title && !a.scoreDisplayMode?.includes("informative")) {
      if (!problems.has(a.title)) problems.set(a.title, new Set());
      problems.get(a.title).add(name);
    }
  }
}
if (problems.size) {
  console.log("\n  Opportunities:");
  for (const [title, pages] of [...problems].slice(0, 8))
    console.log(`    · ${title}  (${[...pages].join(", ")})`);
}

server.close();
if (failed.length) {
  console.log("\n  \x1b[31mBELOW BUDGET\x1b[0m");
  failed.forEach((f) => console.log("    " + f));
  process.exit(1);
}
console.log("\n  \x1b[32mAll pages meet budget.\x1b[0m\n");
