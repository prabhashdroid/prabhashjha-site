/* ============================================================
   Automatic SEO keyword engine.

   Runs at BUILD time. Nobody types keywords — not you, not me.
   You pick a Topic in the admin; everything below is derived.

   For each post it produces a ranked keyword set from three sources:
     1. the Topic's own vocabulary (so every post inherits the terms
        that topic should rank for),
     2. terms lifted out of the title and headings (weighted heavily,
        because that is what the post is actually about),
     3. repeated phrases in the body (single words and two-word
        phrases, scored by frequency).

   Those keywords then drive the meta keywords tag, the `keywords` and
   `about` fields in the BlogPosting schema that Google and AI
   assistants read, and the "related posts" links at the bottom of
   every article.
   ============================================================ */

/** Words that carry no topical meaning — never allowed to become keywords. */
const STOP = new Set(`a about above after again against all am an and any are aren as at be because been
before being below between both but by can cannot could couldn did didn do does doesn doing don down during
each few for from further had hadn has hasn have haven having he her here hers herself him himself his how
i if in into is isn it its itself just let me more most mustn my myself no nor not now of off on once only
or other ought our ours ourselves out over own same shan she should shouldn so some such than that the their
theirs them themselves then there these they this those through to too under until up very was wasn we were
weren what when where which while who whom why with won would wouldn you your yours yourself yourselves
also get got make makes made take takes taken go goes going come comes came want wants need needs use uses
used using thing things way ways lot lots really actually even still much many one two three first second
new good better best big small like will may might must shall since however thus hence able across almost
alone along already although always among around because become becomes becoming behind
day days week weeks month months year years time times people person someone everyone anything something
know knows knew think thinks thought say says said see sees seen look looks looked give gives given
find finds found try tries tried keep keeps kept put puts start starts started work works worked
run runs ran help helps helped mean means meant tell tells told ask asks asked
i'm i've it's that's you're they're we're don't doesn't didn't isn't aren't wasn't won't can't
here's there's what's let's who's how's whats theyre youre dont doesnt didnt isnt wasnt wont cant
your you yours my mine our ours their theirs
seven six five four ten dozen single simple quick easy hard real true false plain
skip stop avoid fix fixes fixed order carried actual actually tends tend heading toward
wish zero none nothing everything anyone nobody somebody whatever whoever
kill kills killing quietly slowly badly properly wrongly right wrong
step steps part parts point points idea ideas note notes example examples
day one couple learning learn learned learns big small long short high low
version versions kind kinds type types sort sorts bit lots plenty
today tomorrow yesterday later earlier soon`.split(/\s+/).filter(Boolean));

/** Section furniture. These appear in headings on every post, so without this
    they outrank the actual subject matter. */
const BOILERPLATE = [
  "key takeaway", "takeaway", "faq", "faqs", "conclusion", "summary", "introduction",
  "bottom line", "final thought", "in short", "tldr", "what next", "next step",
  "quick recap", "recap", "further reading", "read more", "table of contents",
  "frequently asked", "asked question", "common question", "the fix", "how to fix",
  "why it happens", "what to do", "in practice", "for example", "the point",
];
/** Verbs that lead a phrase turn it into an instruction ("recommend honestly"),
    which is never what someone types into Google. */
const VERB_LEAD = new Set(`recommend recommends disclose discloses running runs pick picks picking
driving drives earns earn lose loses losing pays pay paying turns turn turning build builds building
choose chooses choosing send sends sending write writes writing read reads reading
add adds adding set sets setting show shows showing bring brings check checks
treat treats treating spend spends spending save saves saving
increase increases reduce reduces improve improves grow grows growing
create creates creating launch launches sell sells selling buy buys buying`.split(/\s+/).filter(Boolean));

const isBoilerplate = (t: string) => BOILERPLATE.some((b) => t === b || t.includes(b) || b.includes(t));

/** Phrases that are meaningful even though a word-level filter would drop them. */
const ACRONYM = new Set(["roas", "ltv", "cac", "cpc", "cpm", "ctr", "cpa", "seo", "aov", "roi", "kpi", "b2b", "b2c", "d2c", "ai", "ppc", "crm", "gtm"]);

const clean = (s: string) =>
  s
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .toLowerCase();

const tokenise = (s: string) =>
  clean(s)
    .replace(/[’']/g, "'").replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[''-]+|[''-]+$/g, ""))
    .filter((w) => w.length > 1);

const usable = (w: string) =>
  (ACRONYM.has(w) || (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))) && !STOP.has(w);

/** Pull the headings out of a markdown body — these say what the post covers. */
const headings = (body: string) =>
  (body.match(/^#{2,4}\s+(.+)$/gm) ?? []).map((h) => h.replace(/^#+\s+/, "")).join(". ");

function score(text: string, weight: number, out: Map<string, number>) {
  const words = tokenise(text);
  for (const w of words) if (usable(w)) out.set(w, (out.get(w) ?? 0) + weight);
  // two-word phrases catch the terms people actually search for
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i], b = words[i + 1];
    if (!usable(a) || !usable(b)) continue;
    const p = `${a} ${b}`;
    out.set(p, (out.get(p) ?? 0) + weight * 1.6);
  }
}

export type KeywordInput = {
  title: string;
  description?: string;
  body?: string;
  category: string;
  topicKeywords?: string[];
};

/**
 * Ranked keywords for a post. Topic vocabulary first (so the post always
 * carries its topic's terms), then what the post itself is about.
 */
export function keywordsFor(input: KeywordInput, limit = 12): string[] {
  const { title = "", description = "", body = "", topicKeywords = [] } = input;
  const m = new Map<string, number>();

  score(title, 12, m);
  score(headings(body), 5, m);
  score(description, 4, m);
  score(body, 1, m);

  // A phrase beats its own halves: drop "affiliate" if "affiliate marketing"
  // scores higher, so the list reads like search queries, not word soup.
  // How often each candidate actually occurs in the body. A phrase that appears
  // once, in the title only, is not what the post is about.
  const bodyCounts = new Map<string, number>();
  const bw = tokenise(body);
  for (const w of bw) bodyCounts.set(w, (bodyCounts.get(w) ?? 0) + 1);
  for (let i = 0; i < bw.length - 1; i++) {
    const p2 = `${bw[i]} ${bw[i + 1]}`;
    bodyCounts.set(p2, (bodyCounts.get(p2) ?? 0) + 1);
  }

  const ranked = [...m.entries()].sort((a, b) => b[1] - a[1]);
  const chosen: string[] = [];
  let singles = 0;
  for (const [term, sc] of ranked) {
    if (sc < 3) continue;
    if (isBoilerplate(term)) continue;
    if (term.includes("'")) continue;
    // must recur in the body: twice for a word, twice for a phrase
    if ((bodyCounts.get(term) ?? 0) < 2) continue;
    const parts = term.split(" ");

    if (parts.length === 1) {
      // A bare word is only a useful search term if the post leans on it hard.
      // Otherwise we end up with "money", "page", "trust" — true, but useless.
      if ((bodyCounts.get(term) ?? 0) < 4) continue;
      if (singles >= 3) continue;
      if (ranked.some(([t, s2]) => t !== term && t.split(" ").includes(term) && s2 >= sc)) continue;
      singles++;
    } else {
      if (VERB_LEAD.has(parts[0])) continue;
      if (chosen.includes(parts[0]) && chosen.includes(parts[1])) continue;
      // Drop phrases chained off the previous one ("recommend honestly" then
      // "honestly disclose") — they come from a single sentence, not a theme.
      if (chosen.some((c) => c.endsWith(" " + parts[0]) || c.startsWith(parts[1] + " "))) continue;
    }

    chosen.push(term);
    if (chosen.length >= limit) break;
  }

  const seeds = topicKeywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
  const merged = [...new Set([...seeds.slice(0, 3), ...chosen])].slice(0, limit);
  return merged.map(titleish);
}

/** "affiliate marketing" -> "Affiliate Marketing", but keep acronyms upper. */
const titleish = (s: string) =>
  s
    .split(" ")
    .map((w) => (ACRONYM.has(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

/** How strongly two posts overlap — used to pick genuinely related reading. */
export function overlap(a: string[], b: string[]): number {
  const B = new Set(b.map((x) => x.toLowerCase()));
  let n = 0;
  for (const k of a) if (B.has(k.toLowerCase())) n += k.includes(" ") ? 2 : 1;
  return n;
}
