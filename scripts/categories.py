#!/usr/bin/env python3
"""Recover each post's category from the live Wix category pages and write it
into frontmatter. 7 fetches instead of 40."""
import re, os, json, urllib.request
UA={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125 Safari/537.36"}
BASE="https://www.prabhashjha.com"
CATS=[("digital-marketing","Digital Marketing"),("performance-affiliate","Performance & Affiliate"),
      ("brand-building","Brand Building"),("business-finance","Business & Finance"),
      ("ai-automation-1","AI & Automation"),("founder-lessons","Founder Lessons"),
      ("marketing","Business")]
POSTS=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),"src","content","posts")

def get(u):
    try:
        return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=45).read().decode("utf-8","ignore")
    except Exception as e:
        print("  fetch failed",u,e); return ""

slug2cat={}
for slug,label in CATS:
    for page in ("", "?page=2"):
        h=get(f"{BASE}/blog/categories/{slug}{page}")
        found=set(re.findall(r'/post/([a-z0-9\-]+)',h))
        for s in found: slug2cat.setdefault(s,label)
        print(f"  {label:<24} {len(found)} posts{' (p2)' if page else ''}")

n=0
for fn in sorted(os.listdir(POSTS)):
    if not fn.endswith(".md"): continue
    p=os.path.join(POSTS,fn); s=open(p,encoding="utf-8").read()
    m=re.search(r'^slug: "([^"]+)"',s,re.M)
    if not m: continue
    cat=slug2cat.get(m.group(1))
    if not cat: continue
    if re.search(r'^category:',s,re.M):
        s=re.sub(r'^category: .*$',f'category: "{cat}"',s,count=1,flags=re.M)
    else:
        s=s.replace('\nslug: "',f'\ncategory: "{cat}"\nslug: "',1)
    open(p,"w",encoding="utf-8").write(s); n+=1
print(f"\ntagged {n} posts")
json.dump(slug2cat,open("/tmp/cats.json","w"))
