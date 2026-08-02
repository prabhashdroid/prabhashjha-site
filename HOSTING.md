# Deploying prabhashjha.com

The site is 100% static. Hosting is free.

## Recommended: Cloudflare Pages (free, fast in India/SEA)

1. Put the code on GitHub
       cd ~/ADVOLT/prabhashjha-site
       git init && git add -A && git commit -m "New site"
       # create an empty repo on github.com, then:
       git remote add origin https://github.com/<you>/prabhashjha-site.git
       git branch -M main && git push -u origin main

2. dash.cloudflare.com -> Workers & Pages -> Create -> Pages -> Connect to Git
       Framework preset : Astro
       Build command    : npm run build
       Output directory : dist
   Deploy. You get a free *.pages.dev URL in ~1 minute.

3. Point the domain (do this LAST, once you're happy)
       Cloudflare Pages -> Custom domains -> add prabhashjha.com + www
       Then update the nameservers/DNS at your registrar as Cloudflare instructs.
   Wix stops serving the site the moment DNS moves. Keep Wix paid until then.

Every future `git push` redeploys automatically.

## Alternative: Vercel
   npx vercel        (from the project folder, follow prompts)
Same result. Cloudflare tends to be faster for an India/SEA audience.

## Before you point the domain — checklist
- [ ] Click every nav link on the *.pages.dev preview
- [ ] Open 3-4 blog posts, check images load
- [ ] Test on your phone
- [ ] Confirm /post/<slug> URLs match the old Wix ones (they do — verified)
- [ ] Re-run `python3 scripts/migrate.py` to pull any posts written on Wix since migration
- [ ] Point the newsletter form at a real provider (see below)

## The newsletter form is not wired up yet
/newsletter posts to "#". Pick a provider (Buttondown, ConvertKit, MailerLite —
all have free tiers) and replace the <form> action with their embed. Ten-minute job.

## Local development
    export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
    cd ~/ADVOLT/prabhashjha-site
    npm run dev      # http://localhost:4321
    npm run build    # -> dist/
