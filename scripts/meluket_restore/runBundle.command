#!/bin/zsh
# B"H
# Boruch Hashem
# Blessed is He

NODE="/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node"
ROOT="/Users/awtsmoos/awtsmoos.com"
LOG="$ROOT/ai_thoughts/2026-07-22-meluket-production-restoration/12-build-bundle.log"
DONE="$ROOT/ai_thoughts/2026-07-22-meluket-production-restoration/12-build-bundle.done"

cd "$ROOT" || exit 1
"$NODE" scripts/meluket_restore/buildBundle.js > "$LOG" 2>&1
printf "%s\n" "$?" > "$DONE"
