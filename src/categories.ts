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
