/* GitHub OAuth — step 2: swap the code for a token and hand it to Decap.
 *
 * Decap opens this in a popup and listens for a postMessage from it. The
 * message format below is what Decap expects; changing it breaks login.
 */
import { CLIENT_ID } from "./auth.js";

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

  if (!env.GITHUB_CLIENT_SECRET) {
    return new Response(
      "GITHUB_CLIENT_SECRET is not set on this Pages project. Add it under " +
        "Settings → Variables and Secrets, then redeploy.",
      { status: 500 }
    );
  }

  let data;
  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    data = await res.json();
  } catch (e) {
    data = { error_description: "Could not reach GitHub: " + e.message };
  }

  const ok = !!data.access_token;
  const payload = ok
    ? { token: data.access_token, provider: "github" }
    : { error: data.error_description || "No token returned" };

  const msg = `authorization:github:${ok ? "success" : "error"}:${JSON.stringify(payload)}`;

  // Escaped through JSON.stringify so quotes in the payload cannot break out.
  /* Decap's popup handshake, in order:
   *   1. popup  -> opener : "authorizing:github"
   *   2. opener -> popup  : any message (Decap is now listening)
   *   3. popup  -> opener : "authorization:github:success:{...}"
   *
   * Sending step 3 immediately does NOT work — Decap has not attached its
   * listener yet and the message is lost, so the admin sits on the login
   * screen forever. That was the bug. Reply to e.origin, not "*", so the
   * token is never broadcast to an arbitrary window.
   */
  const body = `<!doctype html><meta charset="utf-8"><title>Signing in…</title><body>
<script>
(function () {
  var msg = ${JSON.stringify(msg)};
  function receive(e) {
    if (!window.opener) return;
    window.opener.postMessage(msg, e.origin);
  }
  window.addEventListener("message", receive, false);
  if (window.opener) window.opener.postMessage("authorizing:github", "*");
  else document.body.insertAdjacentHTML("beforeend",
    "<p style='font:14px system-ui;padding:2rem'>Open the admin and click Login with GitHub — this page cannot sign you in on its own.</p>");
})();
</script>
<p style="font:14px system-ui;padding:2rem">${ok ? "Signed in. This window will close." : "Sign-in failed."}</p>
</body>`;

  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
