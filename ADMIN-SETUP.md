# Browser admin — one-time setup (~15 min, ₹0 forever)

End result: you go to **prabhashjha.com/admin**, log in with GitHub, write,
hit Publish. The site rebuilds itself. No terminal. No Cloudflare dashboard.

Only YOU can do these steps — they need your accounts.

--------------------------------------------------------------------
STEP 1 — Put the code on GitHub (5 min)
--------------------------------------------------------------------
  cd ~/ADVOLT/prabhashjha-site
  git init && git add -A && git commit -m "Site"

Create a NEW repo at github.com/new  — name it: prabhashjha-site
Make it PRIVATE if you prefer; both work. Then:

  git remote add origin https://github.com/<YOUR-USERNAME>/prabhashjha-site.git
  git branch -M main && git push -u origin main

--------------------------------------------------------------------
STEP 2 — Deploy the site on Cloudflare Pages (5 min)
--------------------------------------------------------------------
dash.cloudflare.com -> Workers & Pages -> Create -> Pages -> Connect to Git
  Framework preset : Astro
  Build command    : npm run build
  Output directory : dist
Deploy. You get a free <something>.pages.dev URL.

--------------------------------------------------------------------
STEP 3 — GitHub OAuth app (3 min)
--------------------------------------------------------------------
github.com/settings/developers -> OAuth Apps -> New OAuth App
  Application name  : Prabhash CMS
  Homepage URL      : https://www.prabhashjha.com
  Authorization callback URL:
        https://prabhashjha-cms-auth.<YOUR-CF-SUBDOMAIN>.workers.dev/callback
        (you'll get this exact URL in step 4 — put a placeholder now, edit after)

Click "Generate a new client secret".
KEEP the Client ID and Client Secret on screen for the next step.

--------------------------------------------------------------------
STEP 4 — Deploy the OAuth worker (3 min)
--------------------------------------------------------------------
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
  cd ~/ADVOLT/prabhashjha-site/oauth-worker
  npx wrangler login
  npx wrangler deploy
  npx wrangler secret put GITHUB_CLIENT_ID       # paste Client ID
  npx wrangler secret put GITHUB_CLIENT_SECRET   # paste Client Secret

wrangler prints your worker URL. Copy it.
Go back to STEP 3 and set the callback URL to  <worker-url>/callback

--------------------------------------------------------------------
STEP 5 — Point the CMS at both (1 min)
--------------------------------------------------------------------
Edit  public/admin/config.yml  and replace the two placeholders:

  repo: <YOUR-GITHUB-USERNAME>/prabhashjha-site
  base_url: <your worker URL, no trailing slash>

Then:
  git add -A && git commit -m "Wire CMS" && git push

--------------------------------------------------------------------
DONE — how you publish from now on
--------------------------------------------------------------------
1. Go to  https://www.prabhashjha.com/admin
2. "Login with GitHub"
3. Posts -> New Post. Fill Title, URL slug, Description, Date, Cover, Content.
4. Publish.
5. Cloudflare rebuilds automatically. Live in ~60 seconds.

RULES
- NEVER change the URL slug of a post that is already published.
  That breaks its Google ranking. Change the title freely; the slug is the address.
- Description: 140-160 characters. It is what shows in Google results.
- /admin is set to noindex, so Google will not list your admin page.

If you ever want to write without the browser:
  npm run cms      -> localhost:4322/keystatic  (works offline, no GitHub needed)
