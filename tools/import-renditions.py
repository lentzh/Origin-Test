#!/usr/bin/env python3
"""Liest renditions.xlsx und erzeugt lib/renditions-catalog.json (LRA NDR)."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "renditions.xlsx"
OUT = ROOT / "lib" / "renditions-catalog.json"

# Spalten: Format | (Profil/Tag) | Endung | Auflösung | Codec | Bemerkung/ARD


def col_row(ref):
    col, row = "", ""
    for c in ref:
        if c.isalpha():
            col += c
        else:
            row += c
    return col, int(row) if row else 0


def col_to_idx(col):
    n = 0
    for c in col:
        n = n * 26 + (ord(c.upper()) - 64)
    return n - 1


def read_sheet(path: Path):
    with zipfile.ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall(".//m:si", NS):
                texts = []
                for t in si.findall(".//m:t", NS):
                    if t.text:
                        texts.append(t.text)
                shared.append("".join(texts) if texts else "")

        data = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        rows = {}
        for c in data.findall(".//m:sheetData/m:row/m:c", NS):
            ref = c.get("r")
            col, row = col_row(ref)
            ci = col_to_idx(col)
            v = c.find("m:v", NS)
            if v is None or v.text is None:
                val = ""
            elif c.get("t") == "s":
                val = shared[int(v.text)]
            else:
                val = v.text
            rows.setdefault(row, {})[ci] = str(val).strip()
        return rows


def file_suffix_from_endung(endung: str) -> str | None:
    if not endung or not endung.startswith("."):
        return None
    name = endung.lstrip(".")
    if not name.endswith(".mp4"):
        return None
    return name[: -len(".mp4")]


def codec_group(codec: str, fmt: str) -> str:
    c = (codec or "").upper()
    f = (fmt or "").upper()
    if "FLASH" in f:
        return "Flash (historisch)"
    if "HEVC" in f or "HEVC" in c:
        return "HEVC"
    if "VP9" in f or "VP9" in c:
        return "VP9"
    if "AUDIO" in c or "NUR AUDIO" in f.upper():
        return "Audio"
    return "AVC (H.264)"


def slug_id(profile: str, suffix: str, fmt: str) -> str:
    if profile:
        return re.sub(r"[^a-z0-9]+", "-", profile.lower()).strip("-")
    base = suffix.replace(".", "-")
    return base or re.sub(r"[^a-z0-9]+", "-", fmt.lower())[:40]


def parse_rows(rows: dict) -> list:
    items = []
    for r in sorted(rows.keys()):
        if r == 1:
            continue
        cells = rows[r]
        max_ci = max(cells.keys()) if cells else 0
        line = [cells.get(i, "") for i in range(max_ci + 1)]

        fmt = line[0] if len(line) > 0 else ""
        profile = line[1] if len(line) > 1 else ""
        endung = line[2] if len(line) > 2 else ""
        resolution = line[3] if len(line) > 3 else ""
        codec = line[4] if len(line) > 4 else ""
        remark = line[5] if len(line) > 5 else ""
        ard = line[6] if len(line) > 6 else ""

        suffix = file_suffix_from_endung(endung)
        checkable = suffix is not None

        desc_parts = []
        if profile:
            desc_parts.append(profile)
        if resolution:
            desc_parts.append(resolution)
        if codec:
            desc_parts.append(codec)
        desc = " · ".join(desc_parts) if desc_parts else fmt

        items.append(
            {
                "id": slug_id(profile, suffix or "", fmt),
                "group": codec_group(codec, fmt),
                "fileSuffix": suffix,
                "checkable": checkable,
                "label": fmt,
                "profile": profile or None,
                "desc": desc,
                "resolution": resolution or None,
                "codec": codec or None,
                "remark": remark or None,
                "fileExt": endung if endung else None,
                "ard": ard or None,
            }
        )
    return items


def main():
    src = XLSX
    if not src.exists():
        src = Path("/Users/lentzh/Downloads/renditions.xlsx")
    rows = read_sheet(src)
    renditions = parse_rows(rows)

    catalog = {
        "version": "1.4",
        "source": "renditions.xlsx",
        "lras": {
            "ndr": {
                "id": "ndr",
                "label": "LRA NDR",
                "broadcaster": "progressive",
                "renditions": renditions,
            }
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(renditions)} renditions to {OUT}")

    html_path = ROOT / "origin-availability-checker.html"
    if html_path.exists():
        text = html_path.read_text(encoding="utf-8")
        start_marker = "/* CATALOG_START */"
        end_marker = "/* CATALOG_END */"
        if start_marker in text and end_marker in text:
            embed = "const LRA_CATALOG = " + json.dumps(catalog, ensure_ascii=False) + ";"
            s = text.index(start_marker) + len(start_marker)
            e = text.index(end_marker)
            text = text[:s] + "\n" + embed + "\n        " + text[e:]
            html_path.write_text(text, encoding="utf-8")
            print(f"Embedded catalog into {html_path.name}")


if __name__ == "__main__":
    main()
