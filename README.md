# prabhashjha.com

Astro 5 + Tailwind 4. Public pages ship zero JS framework.
40 posts migrated from Wix, original URLs preserved.

## Everyday use

    export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
    cd ~/ADVOLT/prabhashjha-site

    npm run dev      # preview the site      -> localhost:4321
    npm run cms      # WRITE POSTS (Keystatic) -> localhost:4322/keystatic
    npm run build    # static output -> dist/

### Writing a post — browser (recommended)
Go to prabhashjha.com/admin, log in with GitHub, write, Publish.
One-time setup: see ADMIN-SETUP.md

### Writing a post — offline (Keystatic)
1. `npm run cms`
2. Open http://localhost:4322/keystatic
3. Posts -> + New. Fill title, slug, description, date, cover URL, content.
4. Save. It writes a .md file into src/content/posts/.
5. `git add -A && git commit -m "New post" && git push`  -> auto-deploys.

Keystatic runs ONLY on your machine (npm run cms). The live site stays
100% static, so hosting stays free and fast. Don't change the slug of a
post that's already published — that breaks its Google ranking.

## Newsletter — one line to activate
Open `src/site.config.ts`, put your Buttondown username in
`BUTTONDOWN_USERNAME`. Free account at buttondown.com.
Until then the form shows a "Follow on LinkedIn" button instead.

## Re-pull anything still on Wix
    python3 scripts/migrate.py

## Hosting
See HOSTING.md. Cloudflare Pages, free, build `npm run build`, output `dist`.

## Structure
    src/pages/          index, blog, about, work-with-me, newsletter, post/[slug]
    src/content/posts/  40 markdown posts
    src/layouts/        Base.astro — header, footer, SEO, JSON-LD, animations
    src/styles/         global.css — palette + animation system
    public/robots.txt   AI crawlers explicitly allowed
