#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; mkdir -p "$ROOT/assets/seq"; counts=()
for n in 1 2 3; do mkdir -p "$ROOT/assets/seq/$n"; video=$(find "$ROOT/video" -maxdepth 1 -type f -name "$n-*.mp4" -print -quit 2>/dev/null || true); if [[ -n "$video" ]]; then rm -f "$ROOT/assets/seq/$n"/*.webp; ffmpeg -hide_banner -loglevel error -i "$video" -vf "scale=1280:-2" -quality 80 "$ROOT/assets/seq/$n/%04d.webp"; counts[$n]=$(find "$ROOT/assets/seq/$n" -name '*.webp' | wc -l | tr -d ' '); else counts[$n]=0; fi; done
for n in 0 1 2 3; do src=$(find "$ROOT/frames" -maxdepth 1 -type f -name "$n-*.png" -print -quit 2>/dev/null || true); [[ -z "$src" ]] || ffmpeg -hide_banner -loglevel error -y -i "$src" -vf "scale=1920:-2" -quality 82 "$ROOT/assets/poster-$n.webp"; done
printf '{\n  "sequences": {"1": %s, "2": %s, "3": %s},\n  "generated": "%s"\n}\n' "${counts[1]}" "${counts[2]}" "${counts[3]}" "$(date -u +%FT%TZ)" > "$ROOT/assets/seq/manifest.json"
