/* Outbound link hygiene inside article bodies.
 *
 * Two separate jobs, deliberately not conflated:
 *
 * 1. EVERY external link gets rel="noopener noreferrer" and opens in a new
 *    tab. noopener is a security fix — without it the opened page can reach
 *    back through window.opener and navigate this one.
 *
 * 2. Links to a host listed in site.json > monetisation.affiliateDomains also
 *    get rel="sponsored". Google requires commercial links to be marked, and
 *    an unmarked affiliate link is a manual-action risk that would cost far
 *    more traffic than the link earns.
 *
 * Internal links and anchors are left completely alone.
 */
import { visit } from "unist-util-visit";
import site from "../src/data/site.json" with { type: "json" };

const AFFILIATE = (site?.monetisation?.affiliateDomains ?? []).map((d) =>
  String(d).toLowerCase().replace(/^www\./, "")
);

const hostOf = (href) => {
  try {
    return new URL(href).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
};

export default function rehypeOutboundLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;
      if (!/^https?:\/\//i.test(href)) return; // internal, anchor, mailto, tel

      const host = hostOf(href);
      if (!host || host.endsWith("prabhashjha.com")) return;

      const rel = new Set(String(node.properties.rel ?? "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      if (AFFILIATE.some((d) => host === d || host.endsWith("." + d))) {
        rel.add("sponsored");
      }

      node.properties.rel = [...rel].join(" ");
      node.properties.target = "_blank";
    });
  };
}
