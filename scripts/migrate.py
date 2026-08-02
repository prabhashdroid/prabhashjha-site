#!/usr/bin/env python3
"""Migrate prabhashjha.com (Wix) blog posts -> Markdown for Astro.

Scrapes the public, server-rendered post pages. No API key needed.
Preserves: title, excerpt, date, cover image, headings, lists, quotes,
links, bold, and inline images. Keeps the original slug so URLs don't break.
"""
import re, os, sys, json, html, urllib.request, urllib.error
from html.parser import HTMLParser

BASE = "https://www.prabhashjha.com"
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "content", "posts")
IMGDIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125 Safari/537.36"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", "ignore")


def post_urls():
    xml = fetch(f"{BASE}/blog-posts-sitemap.xml")
    urls = re.findall(r"<loc>(.*?)</loc>", xml)
    return [u for u in urls if "/post/" in u]


BLOCK = {"h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "blockquote", "div"}


class Extract(HTMLParser):
    """Walk the rich-content region and emit Markdown."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.md = []
        self.buf = []
        self.tagstack = []
        self.listtype = []
        self.depth_capture = 0
        self.bold = 0
        self.href = None
        self.in_skip = 0

    # -- helpers -------------------------------------------------
    def _flush(self, prefix="", suffix=""):
        t = "".join(self.buf)
        t = re.sub(r"[ \t]+", " ", t).strip()
        self.buf = []
        if t:
            self.md.append(prefix + t + suffix)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style", "noscript"):
            self.in_skip += 1
            return
        if self.in_skip:
            return
        if tag in ("strong", "b"):
            self.bold += 1
            self.buf.append("**")
        elif tag in ("em", "i"):
            self.buf.append("*")
        elif tag == "span":
            st = (a.get("style") or "")
            if "font-weight:700" in st.replace(" ", "") or "font-weight:bold" in st.replace(" ", ""):
                self.bold += 1
                self.buf.append("**")
                self.tagstack.append("boldspan")
                return
            self.tagstack.append("span")
            return
        elif tag == "a":
            self.href = a.get("href")
            self.buf.append("[")
        elif tag == "p":
            # Wix nests <p> inside <li>; flushing here would eat the bullet marker
            if "li" not in self.tagstack:
                self._flush()
        elif tag in ("h2", "h3", "h4", "blockquote"):
            self._flush()
        elif tag == "li":
            self._flush()
        elif tag in ("ul", "ol"):
            self._flush()
            self.listtype.append("-" if tag == "ul" else "1.")
        elif tag == "img":
            src = a.get("src") or ""
            alt = (a.get("alt") or "").replace("]", "")
            if "static.wixstatic.com" in src and "blur" not in src:
                self.md.append(f"![{alt}]({src})")
        self.tagstack.append(tag)

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.in_skip = max(0, self.in_skip - 1)
            return
        if self.in_skip:
            return
        if self.tagstack and self.tagstack[-1] == "boldspan" and tag == "span":
            self.buf.append("**")
            self.bold -= 1
            self.tagstack.pop()
            return
        if self.tagstack and self.tagstack[-1] == "span" and tag == "span":
            self.tagstack.pop()
            return
        if tag in ("strong", "b"):
            self.buf.append("**")
            self.bold -= 1
        elif tag in ("em", "i"):
            self.buf.append("*")
        elif tag == "a":
            self.buf.append(f"]({self.href or '#'})")
            self.href = None
        elif tag == "h2":
            self._flush("## ")
        elif tag == "h3":
            self._flush("### ")
        elif tag == "h4":
            self._flush("#### ")
        elif tag == "blockquote":
            self._flush("> ")
        elif tag == "p":
            if "li" not in self.tagstack[:-1]:
                self._flush()
        elif tag == "li":
            marker = self.listtype[-1] if self.listtype else "-"
            self._flush(marker + " ")
        elif tag in ("ul", "ol"):
            if self.listtype:
                self.listtype.pop()
        if self.tagstack and self.tagstack[-1] == tag:
            self.tagstack.pop()

    def handle_data(self, d):
        if not self.in_skip:
            self.buf.append(d)


def article_region(h):
    """Slice out just the rich-content area of a Wix post page.

    The rendered article lives inside <div data-id="content-viewer"> ... and the
    last rich-content block is marked data-hook="rcv-blockN". Anchoring on the
    content-viewer open tag avoids dragging in its huge inline CSS-var style attr.
    """
    i = h.find('data-id="content-viewer"')
    if i < 0:
        i = h.find('data-hook="rcv-block')
        if i < 0:
            return ""
    start = h.find(">", i)
    if start < 0:
        return ""
    start += 1
    last = h.rfind('data-hook="rcv-block')
    end = h.find("</section", last) if last > start else -1
    if end < 0:
        end = h.find("</section", start)
    if end < 0:
        end = min(len(h), start + 60000)
    return h[start:end]


def meta(h, prop, attr="property"):
    m = re.search(rf'<meta[^>]*{attr}="{re.escape(prop)}"[^>]*content="([^"]*)"', h)
    if not m:
        m = re.search(rf'<meta[^>]*content="([^"]*)"[^>]*{attr}="{re.escape(prop)}"', h)
    return html.unescape(m.group(1)) if m else ""


def yaml_escape(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def migrate(url, idx, total):
    slug = url.rstrip("/").split("/")[-1]
    h = fetch(url)
    title = meta(h, "og:title") or ""
    if not title:
        m = re.search(r"<title>(.*?)</title>", h, re.S)
        title = html.unescape(m.group(1)).strip() if m else slug
    title = re.sub(r"\s*\|\s*Prabhash.*$", "", title).strip()
    desc = meta(h, "og:description") or meta(h, "description", "name")
    cover = meta(h, "og:image")
    date = meta(h, "article:published_time") or ""
    if not date:
        m = re.search(r'"datePublished":"([^"]+)"', h)
        date = m.group(1) if m else ""

    p = Extract()
    p.feed(article_region(h))
    p._flush()
    body = "\n\n".join(x for x in p.md if x.strip())
    body = re.sub(r"\n{3,}", "\n\n", body)
    # strip trailing site chrome that sometimes trails the article
    body = re.split(r"\n##\s*(Recent Posts|Subscribe for Updates|Comments)\b", body)[0].strip()

    fm = ["---",
          f"title: {yaml_escape(title)}",
          f"description: {yaml_escape(desc)}",
          f"pubDate: {yaml_escape(date[:10] or '2026-01-01')}",
          f"cover: {yaml_escape(cover)}",
          f"slug: {yaml_escape(slug)}",
          "---", ""]
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, slug + ".md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(fm) + body + "\n")
    words = len(body.split())
    print(f"  [{idx}/{total}] {slug[:52]:<54} {words:>5} words")
    return words


if __name__ == "__main__":
    urls = post_urls()
    if len(sys.argv) > 1:
        urls = urls[: int(sys.argv[1])]
    print(f"migrating {len(urls)} posts\n")
    total = 0
    for i, u in enumerate(urls, 1):
        try:
            total += migrate(u, i, len(urls))
        except Exception as e:
            print(f"  [{i}] FAILED {u}: {e}")
    print(f"\ndone. {total} words total -> {os.path.abspath(OUT)}")
