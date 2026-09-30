#!/usr/bin/env bash
#
# Rebuilds the hero frame tiers from the original JPEG sequence.
#
# The source sequence is a 24fps animation conformed to 30fps by 5:4 pulldown,
# so roughly every fifth frame is a byte-identical repeat of the one before it.
# Dropping those repeats recovers the original 192-frame animation, which the
# runtime then scrubs linearly. Repeats are detected by hash rather than by
# position, so a re-exported sequence with different timing still works.
#
# Emits two tiers:
#   lo/ — 384px wide, loaded up front so the whole timeline is scrubbable fast
#   hi/ — 1280px wide, streamed in the background and swapped in per frame
#
# Run manually after changing the source frames; the output is committed.
#
# Usage: scripts/build-frames.sh [src-dir]
#   src-dir defaults to public/frames-src
#
# The 123MB source JPEGs are not kept in the working tree. Restore them first with:
#   git checkout e5b44e6 -- public/frames && mv public/frames public/frames-src

set -euo pipefail

SRC="${1:-public/frames-src}"
OUT="public/frames"

LO_WIDTH=384
LO_QUALITY=60
HI_WIDTH=1280
HI_QUALITY=78

command -v cwebp >/dev/null || { echo "cwebp not found (brew install webp)" >&2; exit 1; }
[ -d "$SRC" ] || { echo "source dir not found: $SRC" >&2; exit 1; }

shopt -s nullglob
sources=("$SRC"/frame_*.jpg)
(( ${#sources[@]} )) || { echo "no frame_*.jpg in $SRC" >&2; exit 1; }

rm -rf "$OUT/lo" "$OUT/hi"
mkdir -p "$OUT/lo" "$OUT/hi"

kept=0
skipped=0
prev_hash=""

for src in "${sources[@]}"; do
  hash=$(md5 -q "$src")

  # Pulldown repeat of the frame before it — contributes nothing to the scrub.
  if [ "$hash" = "$prev_hash" ]; then
    skipped=$(( skipped + 1 ))
    continue
  fi
  prev_hash="$hash"

  kept=$(( kept + 1 ))
  name=$(printf "f_%04d.webp" "$kept")

  cwebp -quiet -q "$LO_QUALITY" -resize "$LO_WIDTH" 0 "$src" -o "$OUT/lo/$name"
  cwebp -quiet -q "$HI_QUALITY" -resize "$HI_WIDTH" 0 "$src" -o "$OUT/hi/$name"

  printf "\r  encoded %d frames" "$kept"
done

echo
echo "kept $kept frames, dropped $skipped pulldown repeats"
echo "  lo/ $(du -sh "$OUT/lo" | cut -f1)"
echo "  hi/ $(du -sh "$OUT/hi" | cut -f1)"
echo
echo "TOTAL_FRAMES in src/App.tsx must be $kept"
