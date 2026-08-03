/* ============================================================
   Single source of truth for everything that is NOT a blog post.

   Every value here is editable from the admin (Settings), so site
   copy, social links, the newsletter provider, analytics and the
   topic list can all be changed without touching code.

   Falls back safely: a blank value never breaks a page.
   ============================================================ */
import site from "./data/site.json";

export const SITE = site;
export const PROFILE = site.profile;
export const ORG = site.organisation;
export const SOCIAL = site.social;
export const HOME = site.home;
export const FOOTER = site.footer;
export const CONTACT = site.contact as Record<string, any>;
export const COMMENTS = (site as any).comments ?? {};
export const MONETISATION = ((site as any).monetisation ?? {}) as {
  adsTxt?: string;
  affiliateDomains?: string[];
};

/** Hosts whose outbound links are commercial, so they get rel="sponsored"
 *  and trigger the disclosure guard at build time. */
export const affiliateDomains = (): string[] =>
  (MONETISATION.affiliateDomains ?? []).map((d) => d.toLowerCase().replace(/^www\./, ""));

/** Where the contact form posts. Web3Forms is free and needs no server.
 *  With no key set the form degrades to a plain mailto: link, so the page
 *  always gives people a way to reach you. */
export const contactAction = (): string => {
  const k = (CONTACT.formAccessKey || "").trim();
  return k ? "https://api.web3forms.com/submit" : "";
};
export const contactMailto = (): string => {
  const e = (CONTACT.email || "").trim();
  return e ? `mailto:${e}` : "";
};
/** Comments only render once a GitHub Discussions repo is configured. */
export const commentsEnabled = (): boolean =>
  Boolean((COMMENTS.giscusRepo || "").trim() && (COMMENTS.giscusRepoId || "").trim());

/** Only the social links that were actually filled in. */
export const socialLinks = (): { label: string; url: string }[] =>
  (
    [
      ["LinkedIn", site.social.linkedin],
      ["Instagram", site.social.instagram],
      ["X / Twitter", site.social.twitter],
      ["Facebook", site.social.facebook],
    ] as const
  )
    .filter(([, url]) => typeof url === "string" && url.trim().startsWith("http"))
    .map(([label, url]) => ({ label, url: url.trim() }));

/** `sameAs` for the Person schema — this is what ties your profiles together. */
export const sameAs = (): string[] => socialLinks().map((s) => s.url);

/** Newsletter form target; empty means "no provider yet, point people elsewhere". */
export const newsletterAction = (): string => {
  const u = (site.newsletter.buttondownUsername || "").trim();
  return u ? `https://buttondown.com/api/emails/embed-subscribe/${u}` : "";
};

/** Topic name -> URL slug. Kept identical to the old Wix slugs so links survive. */
export const catSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");

export const TOPICS = site.topics.filter((t) => t.name && t.name.trim());
export const TOPIC_NAMES = TOPICS.map((t) => t.name);
export const topicBlurb = (name: string): string =>
  TOPICS.find((t) => t.name === name)?.blurb ?? "";
