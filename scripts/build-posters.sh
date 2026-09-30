#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

WIDTH=${WIDTH:-540}
QUALITY=${QUALITY:-72}

build() {
  local dir="$1"
  local out="$dir/posters"
  [ -d "$dir" ] || return 0
  mkdir -p "$out"

  for src in "$dir"/*.mp4; do
    [ -e "$src" ] || continue
    local name
    name="$(basename "${src%.mp4}")"
    local png="$out/$name.png"
    local webp="$out/$name.webp"

    ffmpeg -y -loglevel error -ss 0 -i "$src" -frames:v 1 \
      -vf "scale=$WIDTH:-2:flags=lanczos" "$png"
    cwebp -quiet -q "$QUALITY" "$png" -o "$webp"
    rm -f "$png"
    printf '%s -> %s (%s)\n' "$src" "$webp" "$(du -h "$webp" | cut -f1 | tr -d ' ')"
  done
}

for dir in "${@:-public/assets/videos}"; do
  build "$dir"
done
