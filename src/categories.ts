/* Topic list, names, blurbs and URL slugs — all driven by the admin
   (Settings -> Topics) via src/data/site.json.

   The slug is stored explicitly rather than generated from the name, so
   renaming a topic in the admin changes the label everywhere WITHOUT
   breaking the URL that Google has already indexed. */
import site from "./data/site.json";

type Topic = { name: string; blurb?: string; slug?: string };
const topics: Topic[] = (site.topics as Topic[]).filter((t) => t?.name?.trim());

const fallbackSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const CATEGORY_SLUGS: Record<string, string> = Object.fromEntries(
  topics.map((t) => [t.name, (t.slug || "").trim() || fallbackSlug(t.name)])
);
export const CATEGORY_BLURBS: Record<string, string> = Object.fromEntries(
  topics.map((t) => [t.name, t.blurb ?? ""])
);
export const CATEGORY_ORDER: string[] = topics.map((t) => t.name);
export const catSlug = (c: string) => CATEGORY_SLUGS[c] ?? fallbackSlug(c);

/* ---- topic colour --------------------------------------------------------
   The homepage sets each topic on a tinted card. The tint is keyed to the
   topic's POSITION in the list, not its name, because topics are editable in
   the admin — a rename would otherwise silently drop the colour, and there is
   no way for the person editing to know that happened.

   The family is deliberately narrow: five blues either side of the site accent
   plus the two warm accents, so the grid reads as one palette rather than as a
   set of unrelated swatches. Every value is a hue only — the card mixes it
   down against the page ground, so contrast is governed by that mix, not by
   the hue itself, and stays legible in both themes. */
const TINTS = [
  "#1A5FD0", // the site accent
  "#0E7C86", // teal
  "#B23A08", // burnt orange
  "#3B4CC0", // indigo
  "#0A6B3F", // green
  "#8A2E67", // plum
  "#1E6FA8", // steel blue
];
export const catTint = (c: string) =>
  TINTS[Math.max(0, CATEGORY_ORDER.indexOf(c)) % TINTS.length];
