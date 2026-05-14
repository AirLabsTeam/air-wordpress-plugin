#!/usr/bin/env bash
# Builds the WordPress.org-ready plugin zip.
#
# wp-scripts plugin-zip auto-bundles README.md and package.json regardless of
# `files` / `.distignore`, and emits a flat archive. WordPress.org expects a
# parent folder named after the slug and only the runtime files. This script
# stages the runtime files into a temp dir and zips them with the right layout.
set -euo pipefail

SLUG="air-asset-picker"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)/${SLUG}"
OUT="${ROOT}/${SLUG}.zip"

trap 'rm -rf "$(dirname "$STAGE")"' EXIT

mkdir -p "$STAGE"
cp "$ROOT/${SLUG}.php" "$STAGE/"
cp "$ROOT/readme.txt"   "$STAGE/"
cp -R "$ROOT/build"     "$STAGE/build"

rm -f "$OUT"
( cd "$(dirname "$STAGE")" && zip -r "$OUT" "$SLUG" >/dev/null )

echo "Built: $OUT"
unzip -l "$OUT"
