/* Kept for backwards compatibility. Everything now lives in the admin
   (Settings) at src/data/site.json — edit it there, not here. */
import { newsletterAction, SOCIAL, SITE } from "./siteData";

export const BUTTONDOWN_USERNAME = SITE.newsletter.buttondownUsername;
export const NEWSLETTER_ACTION = newsletterAction();
export const LINKEDIN_URL = SOCIAL.linkedin;
export const CF_ANALYTICS_TOKEN = SITE.analytics.cloudflareToken;
export const GOOGLE_SITE_VERIFICATION = SITE.analytics.googleSiteVerification;
