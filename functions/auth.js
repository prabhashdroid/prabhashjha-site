/* GitHub OAuth — step 1: send the user to GitHub.
 *
 * This runs as a Cloudflare Pages Function, deployed from this repo with the
 * rest of the site. That means no separate Worker to maintain, and the admin
 * talks to its own origin instead of a third-party domain.
 *
 * Needs one environment variable in the Pages project:
 *   GITHUB_CLIENT_SECRET  (secret)
 * GITHUB_CLIENT_ID is public, so it is inlined below.
 */
export const CLIENT_ID = "Ov23liWBzXpzaoa7Avjq";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const gh = new URL("https://github.com/login/oauth/authorize");
  gh.searchParams.set("client_id", CLIENT_ID);
  gh.searchParams.set("redirect_uri", `${url.origin}/callback`);
  gh.searchParams.set("scope", "repo,user");
  return Response.redirect(gh.toString(), 302);
}
