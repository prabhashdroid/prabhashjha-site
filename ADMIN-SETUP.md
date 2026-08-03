# Logging into the admin on the live site

Local editing needs no setup: `npm run admin` → http://localhost:4321/admin/index.html

This file is about `https://www.prabhashjha.com/admin`, where you log in with GitHub.

## How it works now

The separate Cloudflare Worker was abandoned — its dashboard code editor is
sandboxed against automation, and it was an extra moving part for no benefit.

Instead the OAuth handlers are **Cloudflare Pages Functions in this repo**
(`functions/auth.js`, `functions/callback.js`). They deploy automatically with
every `git push`, and the admin talks to its own origin rather than a
third-party domain.

| Thing | Value |
|---|---|
| Auth endpoints | `https://www.prabhashjha.com/auth` and `/callback` |
| GitHub OAuth app | "prabhashjha.com CMS" — created, callback updated |
| **Client ID** (public) | `Ov23liWBzXpzaoa7Avjq` — inlined in `functions/auth.js` |
| `config.yml` `base_url` | `https://www.prabhashjha.com` |

## The ONE step left — add the client secret

Cloudflare → **Workers & Pages** → **prabhashjha-site** → **Settings** →
**Variables and Secrets** → **Add**:

| Name | Type | Value |
|---|---|---|
| `GITHUB_CLIENT_SECRET` | **Secret** | the secret you generated on the GitHub app |

Type must be **Secret**, not Text. Then trigger a redeploy (Deployments →
latest → **Retry deployment**, or just push any commit).

That's it. No code to paste anywhere.

## Check it

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://www.prabhashjha.com/auth
```

Should print `302 https://github.com/login/oauth/authorize?...`

Then open https://www.prabhashjha.com/admin → **Login with GitHub**.

## If login fails

- **Popup says "GITHUB_CLIENT_SECRET is not set"** → the variable is missing, or
  the project has not redeployed since you added it.
- **"redirect_uri mismatch"** → the GitHub app's callback must be exactly
  `https://www.prabhashjha.com/callback`.
- **Admin loads but shows no posts** → check `repo:` in `public/admin/config.yml`
  reads `prabhashdroid/prabhashjha-site`.

## Forgot something?

There is **no admin password**. Login is your GitHub account, so a forgotten
password is just a normal GitHub email reset. If the client secret is ever
lost, generate a new one on the GitHub app and replace the Cloudflare variable —
two minutes, nothing lost. And every post is a plain markdown file in this repo,
so content is never trapped behind any login.

## Cost

£0. Pages Functions free tier is 100,000 requests/day; a login uses two.

## The old Worker

`prabhashjha-cms-auth` still exists in Cloudflare running a Hello World stub.
It is unused and can be deleted. `oauth-worker/` is kept only for reference.
