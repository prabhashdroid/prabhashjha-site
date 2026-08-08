/* Open Graph card generator.
 *
 *   node scripts/og-card.mjs
 *
 * Renders 1200x630 cards from the site's OWN fonts and palette using headless
 * Chrome, so the card is typeset in Newsreader at the real amber — not
 * approximated by an image model, and not a stock photo of strangers.
 *
 * Why this matters more than on-page decoration: the site gets ~45 sessions a
 * month while its owner posts to LinkedIn daily. The 1200x630 card is seen far
 * more often than the page it points at, so it is the highest-leverage pixel
 * on the property.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "og");

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
].find((p) => fs.existsSync(p));

const b64 = (rel) => fs.readFileSync(path.join(ROOT, rel)).toString("base64");
const SERIF = b64("public/fonts/cY9AfjOCX1hbuyalUrK4397yjIJFJpc.woff2");
const MONO = b64("public/fonts/-F63fjptAgt5VM-kVkqdyU8n1i8q131nj-o.woff2");

/** The card. Deliberately the same devices as the site: warm ink ground,
 *  one amber, hairline rules, tabular mono labels, zero radius. */
const html = ({ eyebrow, title, meta }) => `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family:'Newsreader'; src:url(data:font/woff2;base64,${SERIF}) format('woff2'); font-weight:200 800; }
  @font-face { font-family:'Plex'; src:url(data:font/woff2;base64,${MONO}) format('woff2'); font-weight:400; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{
    background:#0E0F0D; color:#EDEDEA;
    font-family:'Newsreader',serif;
    display:flex; flex-direction:column; justify-content:space-between;
    padding:72px 80px;
    /* the site's ruled-paper texture, at card scale */
    background-image:linear-gradient(to bottom,#2A2C28 1px,transparent 1px);
    background-size:100% 105px;
  }
  .eyebrow{font-family:'Plex',monospace;font-size:19px;letter-spacing:.16em;
    text-transform:uppercase;color:#85867E;display:flex;align-items:center;gap:18px}
  .eyebrow::before{content:'';width:56px;height:2px;background:#D9A441}
  h1{font-size:${title.length > 78 ? 62 : title.length > 46 ? 74 : 88}px;
    font-weight:600;line-height:1.04;letter-spacing:-.015em;
    max-width:17ch;text-wrap:balance}
  .foot{display:flex;align-items:baseline;justify-content:space-between;
    border-top:1px solid #2A2C28;padding-top:26px}
  .who{font-size:27px;color:#EDEDEA}
  .who b{color:#D9A441;font-weight:600}
  .meta{font-family:'Plex',monospace;font-size:18px;letter-spacing:.14em;
    text-transform:uppercase;color:#85867E;font-variant-numeric:tabular-nums}
</style>
<div class="eyebrow">${eyebrow}</div>
<h1>${title}</h1>
<div class="foot">
  <div class="who">prabhashjha<b>.com</b></div>
  <div class="meta">${meta}</div>
</div>`;

async function card(name, data) {
  if (!CHROME) throw new Error("No Chrome found — cannot render OG cards.");
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = path.join(OUT, `.${name}.html`);
  fs.writeFileSync(tmp, html(data));
  const png = path.join(OUT, `${name}.png`);
  await run(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    `--screenshot=${png}`,
    `file://${tmp}`,
  ]).catch((e) => { if (!fs.existsSync(png)) throw e; });
  fs.unlinkSync(tmp);
  return { png, bytes: fs.statSync(png).size };
}

const r = await card("default", {
  eyebrow: "Prabhash Jha · Co-Founder, ADVOLT",
  title: "The marketing playbooks I wish someone gave me 8 years ago.",
  meta: "Practical guides · Free",
});
console.log(`  ${path.relative(ROOT, r.png)}  ${r.bytes.toLocaleString()} bytes`);
