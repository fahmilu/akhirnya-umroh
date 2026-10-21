#!/usr/bin/env python3
"""
Ekstrak Buku Pegangan & Buku Doa (PDF) menjadi data statis untuk aplikasi Nuxt.

- Teks latin (Indonesia, transliterasi) -> HTML yang bisa reflow & dicari
- Teks Arab -> gambar crop dari PDF (supaya harakat 100% sama dengan buku)
- Tabel -> tabel HTML (sel Arab jadi gambar)
- Halaman yang penuh desain/infografis -> gambar halaman utuh + teksnya untuk pencarian

Pakai:  pip install pymupdf pillow
        python scripts/extract.py --pegangan path/Buku_Pegangan.pdf --doa path/Buku_Doa.pdf
"""
import argparse, html, io, json, re, shutil
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "app" / "data"
PUB = ROOT / "public" / "books"

ARABIC_RE = re.compile(r"[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]")
SYMBOL_FONTS = ("NotoNastaliq", "Damascus")
WHITE = 16777215


def slugify(s):
    s = s.lower().replace("’", "").replace("'", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60] or "x"


def is_arabic_span(s):
    f = s["font"]
    if any(x in f for x in SYMBOL_FONTS):
        return False
    if "KFGQPC" in f:
        return True
    t = s["text"].strip()
    return bool(t) and len(ARABIC_RE.findall(t)) >= max(1, len(t) * 0.5)


def symbol_text(s):
    t = s["text"].strip()
    if "ﷻ" in t:
        return "ﷻ"
    if "ﷺ" in t or t:
        return "ﷺ"
    return ""


def save_webp(pix, path, gray=False, quality=80):
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    if gray:
        im = im.convert("L")
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)
    return im.width, im.height


class Book:
    def __init__(self, key, pdf, offset, chapters, cfg):
        self.key, self.offset, self.cfg = key, offset, cfg
        self.doc = pymupdf.open(pdf)
        self.chapters_def = chapters
        self.out_img = PUB / key
        self.n_img = 0

    # ---------- image helpers ----------
    def crop(self, page, rect, kind, zoom, gray, quality=80):
        rect = rect & page.rect
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=rect, alpha=False)
        self.n_img += 1
        name = f"{kind}-{page.number + 1}-{self.n_img}.webp"
        w, h = save_webp(pix, self.out_img / name, gray=gray, quality=quality)
        return f"/books/{self.key}/{name}", w, h

    def page_image(self, page):
        zoom = 1100 / page.rect.width
        r = page.rect
        clip = pymupdf.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * self.cfg["footer"])  # buang footer/logo
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
        name = f"page-{page.number + 1}.webp"
        w, h = save_webp(pix, self.out_img / "pages" / name, quality=62)
        return f"/books/{self.key}/pages/{name}", w, h

    # ---------- page analysis ----------
    def page_lines(self, page):
        W, H = page.rect.width, page.rect.height
        info = page.get_text("dict")
        imgs = [b for b in info["blocks"] if b["type"] == 1]
        lines = []
        for bi, b in enumerate(info["blocks"]):
            if b["type"] != 0:
                continue
            for l in b["lines"]:
                if abs(l["dir"][1]) > 0.1:  # teks vertikal (tab samping)
                    continue
                spans = [s for s in l["spans"] if s["text"].strip() or s["text"] == " "]
                if not spans:
                    continue
                y0 = min(s["bbox"][1] for s in spans)
                if y0 > H * self.cfg["footer"]:
                    continue
                txt = "".join(s["text"] for s in spans).strip()
                if not txt:
                    continue
                ar = [s for s in spans if is_arabic_span(s)]
                lat = [s for s in spans if not is_arabic_span(s) and not any(x in s["font"] for x in SYMBOL_FONTS)]
                kind = "ar" if len("".join(s["text"] for s in ar).strip()) > len("".join(s["text"] for s in lat).strip()) else "lat"
                lines.append(dict(block=bi, spans=spans, bbox=pymupdf.Rect(l["bbox"]), kind=kind, text=txt))
        return lines, imgs, W, H

    def is_visual(self, page, lines, imgs, W, H, tables):
        if tables:
            return False
        body_imgs = [pymupdf.Rect(b["bbox"]) for b in imgs if b["bbox"][1] < H * 0.88]
        over = white = big = 0
        for ln in lines:
            for s in ln["spans"]:
                if not s["text"].strip():
                    continue
                r = pymupdf.Rect(s["bbox"])
                if any(r.intersects(ib) and (r & ib).get_area() > r.get_area() * 0.5 for ib in body_imgs):
                    over += 1
                if s["color"] == WHITE and not s["text"].strip().isdigit():
                    white += 1
                if ln["kind"] == "lat" and 13.5 <= s["size"] < 20:
                    big += 1
        drawings = len(page.get_drawings())
        return over >= 2 or white >= 2 or big >= 2 or drawings >= 12

    # ---------- inline html ----------
    def span_html(self, spans):
        out = []
        for s in spans:
            if any(x in s["font"] for x in SYMBOL_FONTS):
                out.append(f'<span class="saw">{symbol_text(s)}</span>')
                continue
            if is_arabic_span(s):
                continue
            t = html.escape(s["text"].replace("\t", " "))
            f = s["font"]
            bold = "Bold" in f or "Black" in f or (s["flags"] & 16)
            ital = "Italic" in f or (s["flags"] & 2)
            if bold and t.strip():
                t = f"<b>{t}</b>"
            if ital and t.strip():
                t = f"<i>{t}</i>"
            out.append(t)
        h = "".join(out)
        h = re.sub(r"</b>(\s*)<b>", r"\1", h)
        h = re.sub(r"</i>(\s*)<i>", r"\1", h)
        return re.sub(r"\s+", " ", h).strip()

    @staticmethod
    def style(ln):
        sp = [s for s in ln["spans"] if s["text"].strip() and not any(x in s["font"] for x in SYMBOL_FONTS)]
        if not sp:
            sp = ln["spans"]
        size = max(round(s["size"], 1) for s in sp)
        bold = all("Bold" in s["font"] for s in sp)
        ital = all("Italic" in s["font"] for s in sp)
        xbold = all("ExtraBold" in s["font"] or "Black" in s["font"] for s in sp)
        return size, bold, ital, xbold

    # ---------- main per-page conversion ----------
    def convert_page(self, pno):
        page = self.doc[pno]
        lines, imgs, W, H = self.page_lines(page)
        printed = pno + 1 - self.offset
        forced = printed in self.cfg.get("force_visual", ())
        tables = [] if forced else [t for t in page.find_tables().tables if t.row_count >= 2]
        visual = forced or self.is_visual(page, lines, imgs, W, H, tables)
        plain = " ".join(re.sub(r"\s+", " ", l["text"]) for l in lines if l["kind"] == "lat")
        plain = re.sub(r"[؀-ۿﭐ-﷿ﹰ-﻿]+", "", plain)

        if visual:
            src, w, h = self.page_image(page)
            big = sorted((s for l in lines if l["kind"] == "lat" for s in l["spans"]
                          if s["size"] >= self.cfg["section_size"] and s["text"].strip() and not s["text"].strip().isdigit()),
                         key=lambda s: s["bbox"][1])
            parts, last = [], None
            for sp in big:
                if last is not None and sp["bbox"][1] - last > 12:
                    break
                parts.append(sp["text"].strip()); last = sp["bbox"][3]
            title = re.sub(r"\s+", " ", " ".join(parts)).strip()
            return [dict(t="page", src=src, w=w, h=h, p=printed, txt=plain[:4000])], title, plain

        tbl_rects = [pymupdf.Rect(t.bbox) for t in tables]
        items = []  # (y, x, block)
        for t, r in zip(tables, tbl_rects):
            items.append((r.y0, r.x0, self.convert_table(page, t)))
        # figures
        for b in imgs:
            r = pymupdf.Rect(b["bbox"]) & page.rect
            if r.y0 > H * 0.86 or r.is_empty:
                continue
            if r.get_area() < W * H * 0.05 or r.width < W * 0.3:
                continue
            zoom = min(900 / r.width, 2.5)
            src, w, h = self.crop(page, r, "fig", zoom, gray=False, quality=70)
            items.append((r.y0, r.x0, dict(t="img", src=src, w=w, h=h)))

        # text lines (exclude those inside tables)
        lines = [l for l in lines if not any(tr.intersects(l["bbox"]) and (tr & l["bbox"]).get_area() > l["bbox"].get_area() * 0.5 for tr in tbl_rects)]
        groups = self.group_lines(lines)
        col_w = self.cfg["col_w"]
        for g in groups:
            if g["kind"] == "ar":
                r = pymupdf.Rect(g["bbox"])
                r.x0 -= 3; r.x1 += 3; r.y0 -= 2; r.y1 += 3
                zoom = self.cfg["ar_zoom"]
                src, w, h = self.crop(page, r, "ar", zoom, gray=True, quality=82)
                items.append((g["bbox"].y0, g["bbox"].x0, dict(t="ar", src=src, w=w, h=h, pct=round(min(1, r.width / col_w) * 100, 1))))
            else:
                items.append((g["bbox"].y0, g["bbox"].x0, g["block"]))
        # keep text order for text, insert figures/tables by y
        items.sort(key=lambda x: x[0])
        blocks = [i[2] for i in items if i[2]]
        for b in blocks:
            if b.get("t") in ("ar", "img", "table"):
                b["p"] = printed
        return blocks, None, plain

    def convert_table(self, page, t):
        rows = []
        for row in t.rows:
            cells = []
            for c in row.cells:
                if c is None:
                    cells.append(None)
                    continue
                r = pymupdf.Rect(c)
                txt = page.get_text("text", clip=r).strip()
                if ARABIC_RE.search(txt) and len(ARABIC_RE.findall(txt)) > len(txt) * 0.3:
                    rr = pymupdf.Rect(r.x0 + 1, r.y0 + 1, r.x1 - 1, r.y1 - 1)
                    src, w, h = self.crop(page, rr, "cell", 4, gray=True, quality=82)
                    cells.append(dict(ar=src, w=w, h=h))
                else:
                    txt = re.sub(r"[؀-ۿﭐ-﷿ﹰ-﻿]+", "", txt)
                    cells.append(dict(x=re.sub(r"\s+", " ", txt).strip()))
            rows.append(cells)
        # gabungkan sel None (merge) dengan menghitung colspan
        out = []
        for cells in rows:
            r2 = []
            for c in cells:
                if c is None:
                    if r2:
                        r2[-1]["span"] = r2[-1].get("span", 1) + 1
                    continue
                r2.append(c)
            out.append(r2)
        return dict(t="table", rows=out)

    def group_lines(self, lines):
        """Kelompokkan baris menjadi paragraf / heading / list / blok Arab."""
        groups = []
        cur = None
        bullet_re = re.compile(r"^(?:[•●▪◦\-–]\s|\d{1,2}[.)]\s|[a-z][.)]\s)")

        def flush():
            nonlocal cur
            if cur:
                groups.append(cur)
            cur = None

        for ln in lines:
            if ln["kind"] == "ar":
                if cur and cur["kind"] == "ar" and ln["bbox"].y0 - cur["bbox"].y1 < 14 and ln["block"] - cur["lastblock"] <= 2:
                    cur["bbox"] |= ln["bbox"]
                    cur["lastblock"] = ln["block"]
                    continue
                flush()
                cur = dict(kind="ar", bbox=pymupdf.Rect(ln["bbox"]), lastblock=ln["block"])
                continue

            size, bold, ital, xbold = self.style(ln)
            h = self.span_html(ln["spans"])
            raw = re.sub(r"\s+", " ", ln["text"].replace("\t", " ")).strip()
            if not re.sub(r"<[^>]+>", "", h).strip():
                continue
            if raw.isdigit() and len(raw) <= 3:
                continue
            is_bullet = bool(bullet_re.match(raw))
            sty = (size, ital)
            if cur and cur["kind"] == "lat":
                gap = ln["bbox"].y0 - cur["bbox"].y1
                same = (cur["sty"] == sty and gap < size * 0.75 and not is_bullet
                        and abs(cur["size"] - size) < 0.5 and cur["xbold"] == xbold)
                if same:
                    prev = cur["html"]
                    if re.search(r"[A-Za-z]-$", prev) and re.match(r"^[a-z]", raw):
                        frag = re.search(r"([A-Za-z]+)-$", prev).group(1).lower()
                        nxt = re.match(r"^([a-z]+)", raw).group(1)
                        if frag.endswith(nxt) or nxt.startswith(frag):
                            cur["html"] = prev + h
                        else:
                            cur["html"] = prev[:-1] + h
                    else:
                        cur["html"] = prev + " " + h
                    cur["bbox"] |= ln["bbox"]
                    cur["bold"] = cur["bold"] and bold
                    cur["nlines"] += 1
                    continue
            flush()
            cur = dict(kind="lat", bbox=pymupdf.Rect(ln["bbox"]), html=h, sty=sty, size=size,
                       bold=bold, ital=ital, xbold=xbold, bullet=is_bullet, nlines=1, lastblock=ln["block"])
        flush()

        # ubah ke block
        for g in groups:
            if g["kind"] != "lat":
                continue
            h = g["html"]
            text = re.sub(r"<[^>]+>", "", html.unescape(h)).strip()
            size = g["size"]
            if size >= self.cfg["section_size"]:
                g["block"] = dict(t="h", l=1, x=text)
            elif g["bold"] and size >= self.cfg["h2_size"] and len(text) < 120:
                g["block"] = dict(t="h", l=2, x=text)
            elif g["xbold"] and len(text) < 110 and not text.endswith((".", ":", "”", '"')) and g["nlines"] <= 2:
                g["block"] = dict(t="h", l=3, x=text)
            elif g["bullet"]:
                m = re.match(r"^\s*(?:<[bi]>)*\s*([•●▪◦\-–]|\d{1,2}[.)]|[a-z][.)])\s*", h)
                body = h[m.end():] if m else h
                body = re.sub(r"^</[bi]>", "", body).strip()
                mk = m.group(1) if m else "•"
                b = dict(t="li", h=body)
                if mk[0].isdigit() or mk[0].isalpha():
                    b["n"] = mk.rstrip(".)")
                g["block"] = b
            else:
                b = dict(t="p", h=h)
                if g["ital"]:
                    b["k"] = "latin"
                elif size < self.cfg["body_size"] - 0.5:
                    b["k"] = "small"
                g["block"] = b
        return groups

    # ---------- build ----------
    def build(self):
        if self.out_img.exists():
            shutil.rmtree(self.out_img)
        (DATA / self.key).mkdir(parents=True, exist_ok=True)
        for f in (DATA / self.key).glob("*.json"):
            f.unlink()
        manifest = []
        search = []
        for ci, ch in enumerate(self.chapters_def):
            title, start, end = ch["title"], ch["from"], ch["to"]
            slug = ch.get("slug") or slugify(title)
            sections = []
            cur = None

            def new_section(t, p):
                nonlocal cur
                sid = slugify(t)
                base, k = sid, 2
                while any(s["id"] == sid for s in sections):
                    sid = f"{base}-{k}"; k += 1
                cur = dict(id=sid, title=t, page=p, blocks=[], text="")
                sections.append(cur)

            for pno in range(start + self.offset - 1, end + self.offset):
                if pno in self.cfg.get("skip_pages", set()):
                    continue
                blocks, vtitle, plain = self.convert_page(pno)
                printed = pno + 1 - self.offset
                if blocks and blocks[0]["t"] == "page":
                    t = vtitle
                    if t and (cur is None or slugify(t) != slugify(cur["title"])) and len(t) < 90:
                        new_section(t, printed)
                    elif cur is None:
                        new_section(title, printed)
                    cur["blocks"].extend(blocks)
                    cur["text"] += " " + plain
                    continue
                for b in blocks:
                    if b["t"] == "h" and len(b["x"]) <= 6:
                        b = dict(t="p", h=f"<b>{html.escape(b['x'])}</b>", k="or")
                    if b["t"] == "h" and b["l"] <= ch.get("split", self.cfg["split_level"]):
                        if cur is not None and slugify(b["x"]) == slugify(cur["title"]) and not cur["blocks"]:
                            continue
                        if cur is not None and slugify(b["x"]) == slugify(cur["title"]) and printed - cur["page"] <= 2:
                            continue  # judul diulang di halaman berikutnya
                        new_section(b["x"], printed)
                        continue
                    if cur is None:
                        new_section(title, printed)
                    cur["blocks"].append(b)
                    if b["t"] in ("p", "li", "h"):
                        cur["text"] += " " + re.sub(r"<[^>]+>", "", html.unescape(b.get("h") or b.get("x", "")))
                    if b["t"] == "table":
                        for r in b["rows"]:
                            cur["text"] += " " + " ".join(c.get("x", "") for c in r)
            sections = [s for s in sections if s["blocks"]]
            for s in sections:
                txt = re.sub(r"\s+", " ", s.pop("text")).strip()
                search.append(dict(id=f"{self.key}/{slug}#{s['id']}", book=self.key, ch=slug, sec=s["id"],
                                   title=s["title"], chapter=title, page=s["page"], text=txt))
            data = dict(slug=slug, title=title, group=ch.get("group"), sections=sections)
            (DATA / self.key / f"{slug}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
            manifest.append(dict(slug=slug, title=title, group=ch.get("group"), page=start,
                                 sections=[dict(id=s["id"], title=s["title"], page=s["page"]) for s in sections]))
            print(f"[{self.key}] {title}: {len(sections)} bagian")
        return manifest, search


PEGANGAN = [
    dict(title="Kata Pengantar", **{"from": 2, "to": 5}, group="Pembuka"),
    dict(title="Dalil-dalil Keutamaan Ibadah Haji & Umrah", slug="dalil-keutamaan", **{"from": 7, "to": 14}, group="Pembuka"),
    dict(title="Thaharah", **{"from": 17, "to": 24}, group="Fiqih Thaharah & Shalat"),
    dict(title="Shalat", **{"from": 26, "to": 35}, group="Fiqih Thaharah & Shalat"),
    dict(title="Shalat Jenazah", **{"from": 37, "to": 40}, group="Fiqih Thaharah & Shalat"),
    dict(title="Shalat Qashar & Jamak", **{"from": 42, "to": 45}, group="Fiqih Thaharah & Shalat"),
    dict(title="Meraih Haji & Umrah Mabrur", slug="pembekalan-manasik", **{"from": 47, "to": 48}, group="Pembekalan Manasik"),
    dict(title="Masyaril Haram", **{"from": 50, "to": 54}, group="Pembekalan Manasik"),
    dict(title="Makkah Al Mukarramah", **{"from": 55, "to": 65}, group="Pembekalan Manasik"),
    dict(title="Madinah Al Munawwarah", **{"from": 66, "to": 94}, group="Pembekalan Manasik"),
    dict(title="Fiqih Umrah", **{"from": 96, "to": 122}, group="Fiqih Umrah & Haji"),
    dict(title="Fiqih Haji", **{"from": 124, "to": 145}, group="Fiqih Umrah & Haji"),
    dict(title="Kiat-kiat Haji Mabrur", **{"from": 147, "to": 152}, group="Fiqih Umrah & Haji"),
    dict(title="Catatan Lainnya", **{"from": 154, "to": 158}, group="Catatan Lainnya"),
    dict(title="Informasi Cuaca & Tips", slug="cuaca-tips", **{"from": 159, "to": 161}, group="Catatan Lainnya"),
    dict(title="Bahasa Arab untuk Jamaah", slug="bahasa-arab", **{"from": 162, "to": 164}, group="Catatan Lainnya"),
    dict(title="Direktori Belanja di Arab Saudi", slug="direktori-belanja", **{"from": 165, "to": 174}, group="Catatan Lainnya"),
    dict(title="Hal yang Perlu Diperhatikan", slug="hal-diperhatikan", **{"from": 175, "to": 179}, group="Catatan Lainnya"),
    dict(title="Perlengkapan Bagasi & Kabin", slug="perlengkapan", **{"from": 180, "to": 181}, group="Catatan Lainnya"),
    dict(title="Mutaba'ah Yaumiyah", slug="mutabaah-yaumiyah", **{"from": 183, "to": 184}, group="Catatan Lainnya"),
]

DOA = [
    dict(title="Adab-adab dalam Berdoa", slug="adab-berdoa", split=3, **{"from": 9, "to": 16}),
    dict(title="Hal-hal Penyebab Tertolaknya Doa", slug="penyebab-tertolak", split=3, **{"from": 19, "to": 22}),
    dict(title="Doa-doa Perjalanan", slug="perjalanan", **{"from": 25, "to": 28}),
    dict(title="Doa-doa di Tanah Suci", slug="tanah-suci", **{"from": 31, "to": 40}),
    dict(title="Doa-doa Umrah", slug="umrah", **{"from": 43, "to": 74}),
    dict(title="Doa-doa Haji", slug="haji", **{"from": 77, "to": 94}),
    dict(title="Doa Pilihan saat Thawaf, Sa'i & di Raudhah", slug="doa-pilihan", split=3, **{"from": 97, "to": 118}),
    dict(title="Al Ma'tsurat Sughro", slug="al-matsurat", **{"from": 121, "to": 144}),
    dict(title="Dzikir & Doa setelah Shalat", slug="dzikir-setelah-shalat", **{"from": 147, "to": 172}),
    dict(title="Kumpulan Doa Sehari-hari", slug="sehari-hari", **{"from": 175, "to": 230}),
    dict(title="Doa-doa Shalat Jenazah", slug="shalat-jenazah", **{"from": 233, "to": 240}),
    dict(title="Asmaul Husna", slug="asmaul-husna", **{"from": 243, "to": 252}),
    dict(title="Tadabbur Doa & Dzikir Pilihan", slug="tadabbur", split=3, **{"from": 255, "to": 272}),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pegangan", required=True)
    ap.add_argument("--doa", required=True)
    a = ap.parse_args()
    books = [
        ("pegangan", "Buku Pegangan", "Manasik Haji & Umrah", a.pegangan, PEGANGAN,
         dict(footer=0.925, section_size=20, h2_size=11.5, body_size=10, col_w=340, ar_zoom=3.2, split_level=1, force_visual=set(range(162, 165)))),
        ("doa", "Buku Doa", "Doa & Dzikir Haji, Umrah, dan Sehari-hari", a.doa, DOA,
         dict(footer=0.93, section_size=20, h2_size=9.5, body_size=8, col_w=241, ar_zoom=4.4, split_level=2, force_visual=set(range(243, 253)))),
    ]
    index, search = [], []
    for key, title, sub, pdf, chapters, cfg in books:
        b = Book(key, pdf, 4, chapters, cfg)
        m, s = b.build()
        index.append(dict(key=key, title=title, subtitle=sub, chapters=m))
        search += s
    (DATA / "books.json").write_text(json.dumps(index, ensure_ascii=False, indent=1))
    (DATA / "search.json").write_text(json.dumps(search, ensure_ascii=False, separators=(",", ":")))
    print("selesai:", sum(len(c["sections"]) for b in index for c in b["chapters"]), "bagian")


if __name__ == "__main__":
    main()
