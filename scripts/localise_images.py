#!/usr/bin/env python3
"""Download every Wix-hosted image into public/images/posts/ and rewrite the
markdown to point at local copies.

Why: the posts still reference static.wixstatic.com. The day the Wix
subscription lapses those images can disappear — silently, weeks later.
This severs the last dependency on Wix.

Also records real pixel dimensions into frontmatter (coverW/coverH) so the
templates can set width/height and stop causing layout shift (CLS).
"""
import os, re, io, json, hashlib, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "src", "content", "posts")
OUT = os.path.join(ROOT, "public", "images", "posts")
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125 Safari/537.36"}

os.makedirs(OUT, exist_ok=True)
WIX = re.compile(r'https://static\.wixstatic\.com/media/[^\s"\')]+')
cache = {}


def fetch(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:
            if i == tries - 1:
                raise
    return None


def localise(url):
    """Download once, return (public_path, width, height)."""
    if url in cache:
        return cache[url]
    # ask Wix for a sensible max width rather than the raw 6000px original
    fetch_url = url
    if "/v1/" not in url:
        fetch_url = url + "/v1/fill/w_1600,h_900,al_c,q_85/img.jpg"
    try:
        data = fetch(fetch_url)
    except Exception:
        data = fetch(url)

    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    try:
        im = Image.open(io.BytesIO(data))
        im = im.convert("RGB")
        w, ht = im.size
        name = f"{h}.jpg"
        im.save(os.path.join(OUT, name), "JPEG", quality=84, optimize=True, progressive=True)
    except Exception as e:
        print("    ! decode failed:", e)
        return None
    res = (f"/images/posts/{name}", w, ht)
    cache[url] = res
    return res


def main():
    files = sorted(f for f in os.listdir(POSTS) if f.endswith(".md"))
    total_imgs = 0
    for i, fn in enumerate(files, 1):
        p = os.path.join(POSTS, fn)
        s = open(p, encoding="utf-8").read()
        urls = list(dict.fromkeys(WIX.findall(s)))
        if not urls:
            print(f"[{i}/{len(files)}] {fn[:48]:<50} no wix images")
            continue
        coverdim = None
        for u in urls:
            r = localise(u)
            if not r:
                continue
            local, w, h = r
            if s.count(f"cover: \"{u}\"") or f'cover: "{u}"' in s:
                coverdim = (w, h)
            s = s.replace(u, local)
            total_imgs += 1
        # record cover dimensions for width/height (kills layout shift)
        if coverdim and "coverW:" not in s:
            s = s.replace('\nslug: "', f'\ncoverW: {coverdim[0]}\ncoverH: {coverdim[1]}\nslug: "', 1)
        open(p, "w", encoding="utf-8").write(s)
        print(f"[{i}/{len(files)}] {fn[:48]:<50} {len(urls)} image(s)")
    print(f"\nlocalised {total_imgs} references / {len(cache)} unique images -> public/images/posts/")


if __name__ == "__main__":
    main()
