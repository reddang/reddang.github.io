"""Build optimized WebP images for the portfolio.

Every `assets/img/<name>.webp` referenced in projects.json or index.html is
generated from the source image with the same base name in tools/src/.
Card thumbnails also get a smaller copy in assets/img/card/, and WebP files
that nothing references any more are removed.

Usage: python3 tools/build_images.py
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "tools" / "src"
OUT_DIR = ROOT / "assets" / "img"
CARD_DIR = OUT_DIR / "card"

# Wordmark logos: trim the white margin so the mark fills its box
TRIM = {"logo_onpoint", "logo_fv", "logo_pops", "logo_pigroup", "logo_daiichi", "logo_haravan"}

MAX_SIDE = 1600
CARD_SIDE = 760
QUALITY = 80


def find_source(name):
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        p = SRC_DIR / f"{name}{ext}"
        if p.exists():
            return p
    return None


def trim(img, pad=0.06):
    """Crop to the non-white area, keeping a small margin."""
    rgb = img.convert("RGB")
    mask = rgb.point(lambda v: 255 if v < 240 else 0).convert("L")
    box = mask.getbbox()
    if not box:
        return img
    m = int(max(box[2] - box[0], box[3] - box[1]) * pad)
    box = (max(box[0] - m, 0), max(box[1] - m, 0), min(box[2] + m, img.width), min(box[3] + m, img.height))
    return img.crop(box)


def save(img, dest, max_side):
    """Fit the width to max_side; tall images keep their height up to 4x that."""
    img = img.copy()
    img.thumbnail((max_side, max_side * 4), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=QUALITY, method=6)


def main():
    data = json.loads((ROOT / "projects.json").read_text())
    text = (ROOT / "projects.json").read_text() + (ROOT / "index.html").read_text()
    names = sorted(set(re.findall(r"assets/img/(?:card/)?([\w\-]+)\.webp", text)))
    thumbs = {Path(p["thumb"]).stem for p in data if p.get("thumb")}

    missing = []
    for name in names:
        src = find_source(name)
        if not src:
            missing.append(name)
            continue
        img = Image.open(src)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "transparency" in img.info or img.mode in ("LA", "P") else "RGB")
        if name in TRIM:
            img = trim(img)
        dest = OUT_DIR / f"{name}.webp"
        if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
            save(img, dest, MAX_SIDE)
        if name in thumbs:
            card = CARD_DIR / f"{name}.webp"
            if not card.exists() or card.stat().st_mtime < src.stat().st_mtime:
                save(img, card, CARD_SIDE)

    # Remove WebP files that nothing references any more
    for f in OUT_DIR.glob("*.webp"):
        if f.stem not in names:
            f.unlink()
    for f in CARD_DIR.glob("*.webp"):
        if f.stem not in thumbs:
            f.unlink()

    total = sum(f.stat().st_size for f in OUT_DIR.rglob("*.webp"))
    print(f"{len(names) - len(missing)} images ready, {total / 1e6:.1f} MB in assets/img")
    if missing:
        print("MISSING sources:", ", ".join(missing))
        sys.exit(1)


if __name__ == "__main__":
    main()
