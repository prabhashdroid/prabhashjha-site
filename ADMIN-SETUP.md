# Logging into the admin on the live site

Local editing already works with no setup: `npm run admin` → http://localhost:4321/admin/index.html

This file is only about `https://www.prabhashjha.com/admin`, where you log in with GitHub.

## Already done

| Thing | Value |
|---|---|
| Cloudflare Worker | `prabhashjha-cms-auth` — **deployed** |
| Worker URL | https://prabhashjha-cms-auth.prabhash470.workers.dev |
| GitHub OAuth app | "prabhashjha.com CMS" — **created** |
| **Client ID** (not secret) | `Ov23liWBzXpzaoa7Avjq` |
| Callback URL | `https://prabhashjha-cms-auth.prabhash470.workers.dev/callback` |
| `config.yml` `base_url` | **set to the worker** |
| `local_backend` | removed from the deployed config, injected only by `npm run admin` |

The Worker is currently still the "Hello World" stub. Four steps left.

## Step 1 — generate the client secret (yours to do)

github.com/settings/applications/3769437 → **Generate a new client secret** → copy it.

GitHub shows it once. Claude does not handle this value — keep it out of chat.

## Step 2 — paste the Worker code

Cloudflare → Workers & Pages → `prabhashjha-cms-auth` → **Edit code**.
Delete everything in the editor, paste the whole of `oauth-worker/worker.js`
from this repo, then **Deploy**.

## Step 3 — add the two variables

Same Worker → **Settings** → **Variables and secrets** → Add:

| Name | Type | Value |
|---|---|---|
| `GITHUB_CLIENT_ID` | Text | `Ov23liWBzXpzaoa7Avjq` |
| `GITHUB_CLIENT_SECRET` | **Secret** | the value from Step 1 |

Type must be **Secret** for the second one — that encrypts it and hides it from the dashboard afterwards.

Then **Deploy** again so the variables take effect.

## Step 4 — check it

Open https://www.prabhashjha.com/admin and click **Login with GitHub**.
A popup asks you to authorise "prabhashjha.com CMS", then the admin loads with your posts.

Quick sanity check that the Worker is running the real code, not the stub:

```bash
curl -s https://prabhashjha-cms-auth.prabhash470.workers.dev/
```

Should say `Decap OAuth worker is running.` — if it still says `Hello World!`, Step 2 didn't deploy.

## If login fails

- **Popup closes with nothing** → `GITHUB_CLIENT_SECRET` is wrong or missing.
- **"redirect_uri mismatch"** → the callback in the GitHub app must be exactly
  `https://prabhashjha-cms-auth.prabhash470.workers.dev/callback`.
- **Admin loads but shows no posts** → check `repo:` in `public/admin/config.yml`
  reads `prabhashdroid/prabhashjha-site`.

## Cost

£0. Workers free tier is 100,000 requests/day; a CMS login uses two.
