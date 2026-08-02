/**
 * GitHub OAuth proxy for Decap CMS — Cloudflare Worker (free tier).
 * Secrets required: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const redirect = `${url.origin}/callback`;
      const gh = new URL("https://github.com/login/oauth/authorize");
      gh.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      gh.searchParams.set("redirect_uri", redirect);
      gh.searchParams.set("scope", "repo,user");
      return Response.redirect(gh.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await res.json();

      const ok = !!data.access_token;
      const payload = ok
        ? { token: data.access_token, provider: "github" }
        : { error: data.error_description || "No token returned" };

      // Decap listens for this postMessage from the popup.
      const body = `<!doctype html><html><body><script>
        (function () {
          function send() {
            window.opener.postMessage(
              'authorization:github:${ok ? "success" : "error"}:${JSON.stringify(payload).replace(/'/g, "\\\\'")}',
              '*'
            );
          }
          window.addEventListener('message', send, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      <\/script></body></html>`;

      return new Response(body, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Decap OAuth worker is running.", { status: 200 });
  },
};
