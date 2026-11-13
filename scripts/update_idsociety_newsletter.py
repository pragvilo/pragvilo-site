#!/usr/bin/env python3
"""Met à jour les 3 dernières newsletters ID Society sur idsocietyclub/index.html depuis Substack."""
import html, json, re, sys, urllib.request
from datetime import datetime
from pathlib import Path

PAGE = Path(__file__).resolve().parent.parent / "idsocietyclub" / "index.html"
API = "https://idsociety.substack.com/api/v1/archive?sort=new&limit=10"
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      "Accept": "*/*", "Accept-Language": "fr-FR,fr;q=0.9"}


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()


try:
    posts = json.loads(get(API))
    posts = posts["posts"] if isinstance(posts, dict) else posts
    posts = [p for p in posts if p.get("type") == "newsletter" and p.get("audience") != "only_paid"]
except Exception as e:  # l'API refuse parfois les serveurs GitHub : on passe par le flux RSS
    print("API indisponible, flux RSS :", e)
    import xml.etree.ElementTree as ET
    from email.utils import parsedate_to_datetime
    root = ET.fromstring(get("https://idsociety.substack.com/feed"))
    posts = [{"title": i.findtext("title"), "canonical_url": i.findtext("link"),
              "post_date": parsedate_to_datetime(i.findtext("pubDate")).isoformat()}
             for i in root.iter("item")]
posts = posts[:3]
if len(posts) < 3:
    sys.exit("Moins de 3 newsletters récupérées, rien modifié.")

items, prev = [], None
for p in posts:
    title = p["title"].strip()
    m = re.match(r"NL\s*#\s*(\d+)\s*[.:,-]?\s*(.*)", title)
    if m:
        num, title = int(m.group(1)), m.group(2).strip()
    elif prev:
        num = prev - 1
    else:
        sys.exit(f"Numéro introuvable dans : {title}")
    prev = num
    title = re.sub(r"[\U0001F000-\U0001FFFF\u2600-\u27BF\uFE0F]", "", title).strip()
    title = re.sub(r"\s*([:?!;])", r" \1", title)
    d = datetime.fromisoformat(p["post_date"].replace("Z", "+00:00"))
    date = f"{d.day} {MOIS[d.month - 1]} {d.year}"
    url = html.escape(p["canonical_url"], quote=True)
    items.append(
        f'      <a class="issue" href="{url}"><span class="num" aria-hidden="true">{num}</span>'
        f'<span class="meta"><small>NL#{num}, {date}</small><span>{html.escape(title, quote=False)}</span></span>'
        f'<span class="go-arr" aria-hidden="true">→</span></a>'
    )

src = PAGE.read_text(encoding="utf-8")
new, n = re.subn(r'(<div class="issues">\n)(?:\s*<a class="issue".*\n)+',
                 lambda m: m.group(1) + "\n".join(items) + "\n", src, count=1)
if n != 1:
    sys.exit("Bloc newsletters introuvable dans la page.")
if new != src:
    PAGE.write_text(new, encoding="utf-8")
    print("Mis à jour :", ", ".join(f"NL#{i}" for i in range(prev + 2, prev - 1, -1)))
else:
    print("Déjà à jour.")
