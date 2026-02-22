#!/usr/bin/env python3
from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Iterable, List, Tuple

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets"
OUT_BASE = ROOT / "assets" / "optimized"

TARGETS: List[Tuple[str, int, int, int]] = [
    ("mobile-9x16", 1080, 1920, 75),
    ("desktop-16x9", 1920, 1080, 78),
]

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
EXCLUDE_PREFIXES = ("logo", "favicon")
EXCLUDE_EXACT = {"image-manifest.json"}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-") or "image"


def list_source_images() -> Iterable[Path]:
    for path in sorted(SRC_DIR.iterdir()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        lower_name = path.name.lower()
        if lower_name in EXCLUDE_EXACT:
            continue
        if lower_name.startswith(EXCLUDE_PREFIXES):
            continue
        yield path


def crop_to_ratio(image: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src_w, src_h = image.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h

    if abs(src_ratio - target_ratio) < 1e-6:
        return image.copy()

    if src_ratio > target_ratio:
        new_w = int(round(src_h * target_ratio))
        left = max((src_w - new_w) // 2, 0)
        return image.crop((left, 0, left + new_w, src_h))

    new_h = int(round(src_w / target_ratio))
    top = max((src_h - new_h) // 2, 0)
    return image.crop((0, top, src_w, top + new_h))


def ensure_mode(image: Image.Image) -> Image.Image:
    if image.mode in ("RGB", "RGBA"):
        return image
    if "A" in image.getbands():
        return image.convert("RGBA")
    return image.convert("RGB")


def human_kb(num_bytes: int) -> float:
    return round(num_bytes / 1024, 2)


def main() -> None:
    sources = list(list_source_images())
    if not sources:
        print("No se encontraron imágenes para optimizar.")
        return

    for folder, *_ in TARGETS:
        out_dir = OUT_BASE / folder
        out_dir.mkdir(parents=True, exist_ok=True)

    report_rows = []

    for idx, src_path in enumerate(sources, start=1):
        src_size = src_path.stat().st_size
        with Image.open(src_path) as src_img_raw:
            src_img = ImageOps.exif_transpose(src_img_raw)
            src_w, src_h = src_img.size

            for folder, target_w, target_h, quality in TARGETS:
                out_dir = OUT_BASE / folder
                slug = slugify(src_path.stem)
                out_name = f"{idx:03d}-{slug}.webp"
                out_path = out_dir / out_name

                cropped = crop_to_ratio(src_img, target_w, target_h)
                resized = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
                final_img = ensure_mode(resized)

                final_img.save(
                    out_path,
                    format="WEBP",
                    quality=quality,
                    method=6,
                    optimize=True,
                )

                out_size = out_path.stat().st_size
                reduction_pct = round((1 - (out_size / src_size)) * 100, 2)

                report_rows.append(
                    {
                        "source": src_path.name,
                        "source_resolution": f"{src_w}x{src_h}",
                        "source_kb": human_kb(src_size),
                        "target_folder": folder,
                        "target_resolution": f"{target_w}x{target_h}",
                        "output_file": out_name,
                        "output_kb": human_kb(out_size),
                        "reduction_percent": reduction_pct,
                    }
                )

    report_path = OUT_BASE / "optimization-report.csv"
    with report_path.open("w", newline="", encoding="utf-8") as csv_file:
        fieldnames = [
            "source",
            "source_resolution",
            "source_kb",
            "target_folder",
            "target_resolution",
            "output_file",
            "output_kb",
            "reduction_percent",
        ]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(report_rows)

    print(f"Procesadas {len(sources)} imágenes.")
    print(f"Salida mobile: {OUT_BASE / 'mobile-9x16'}")
    print(f"Salida desktop: {OUT_BASE / 'desktop-16x9'}")
    print(f"Reporte: {report_path}")


if __name__ == "__main__":
    main()
