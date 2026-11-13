#!/usr/bin/env python3
"""Met à jour les 3 dernières newsletters ID Society sur idsocietyclub/index.html.

Source : le flux RSS public de la newsletter, lu directement ou, à défaut,
par le lecteur RSS rss2json (Substack ne répond pas aux serveurs GitHub).
"""
import html, json, re, sys, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path

PAGE = Path(__file__).resolve().parent.parent / "idsocietyclub" / "index.html"
FEED = "https://idsociety.substack.com/feed"
RELAIS = "https://api.rss2json.com/v1/api.json?rss_url=" + urllib.parse.quote(FEED, safe="")
UA = {"User-Agent": "pragvilo-site-newsletter-updater (+https://pragvilo.com)"}
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()


def via_rss():
    return [(i.findtext("title"), i.findtext("link"), parsedate_to_datetime(i.findtext("pubDate")))
            for i in ET.fromstring(get(FEED)).iter("item")]


def via_relais():
    d = json.loads(get(RELAIS))
    if d.get("status") != "ok":
        raise RuntimeError(d.get("message", "relais en erreur"))
    return [(i["title"], i["link"], datetime.fromisoformat(i["pubDate"].replace(" ", "T")))
            for i in d["items"]]


posts = []
for source in (via_rss, via_relais):
    try:
        posts = source()
        print("Source :", source.__name__)
        break
    except Exception as e:
        print(source.__name__, "indisponible :", e)
posts = [p for p in posts if p[1].startswith("https://idsociety.substack.com/p/")][:3]
if len(posts) < 3:
    sys.exit("Moins de 3 newsletters récupérées, rien modifié.")

items, nums, prev = [], [], None
for title, link, d in posts:
    title = html.unescape(title).strip()
    m = re.match(r"NL\s*#\s*(\d+)\s*[.:,-]?\s*(.*)", title)
    if m:
        num, title = int(m.group(1)), m.group(2).strip()
    elif prev:
        num = prev - 1
    else:
        sys.exit(f"Numéro introuvable dans : {title}")
    prev = num
    nums.append(num)
    title = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️]", "", title).strip()
    title = re.sub(r"\s*([:?!;])", r" \1", title)
    date = f"{d.day} {MOIS[d.month - 1]} {d.year}"
    items.append(
        f'      <a class="issue" href="{html.escape(link, quote=True)}"><span class="num" aria-hidden="true">{num}</span>'
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
    print("Mis à jour :", ", ".join(f"NL#{i}" for i in nums))
else:
    print("Déjà à jour.")
