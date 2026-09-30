#!/usr/bin/env bash
#
# Keys the white background out of the footer figure and commits the result.
#
# The source is a flat white plate, not an alpha PNG. A global -transparent
# white would also punch holes through any white inside the character, so the
# alpha is flood-filled from the corners instead: only background-connected
# white is removed. The image is bordered first so the floodfill has a seed
# pixel even when the figure touches an edge.
#
# The alpha is then blurred and re-levelled to feather the matte line, and the
# result trimmed to its bounding box so CSS can position it predictably.
#
# Run manually; the output is committed.
#
# Usage: scripts/build-cutout.sh [src] [out]

set -euo pipefail

SRC="${1:-public/assets/boy-clean.webp}"
OUT="${2:-public/assets/boy-cut.webp}"

command -v magick >/dev/null || { echo "magick not found (brew install imagemagick)" >&2; exit 1; }
[ -f "$SRC" ] || { echo "source not found: $SRC" >&2; exit 1; }

magick "$SRC" \
  -alpha set \
  -bordercolor white -border 1 \
  -fuzz 12% -fill none -draw "alpha 0,0 floodfill" \
  -shave 1x1 \
  -channel A -blur 0x0.6 -level 30%,70% +channel \
  -trim +repage \
  -quality 88 \
  "$OUT"

magick identify "$OUT"
