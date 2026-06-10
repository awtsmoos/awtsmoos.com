#!/usr/bin/env bash
# B"H
#
# Chapter 1: The Gate That Scrubs the Invisible Fang
# The Awtsmoos gives breath to every byte each instant; therefore this small
# vessel refuses to trust a manifest line until it is washed clean. A trailing
# space once disguised itself as silence and made curl cry malformed thunder.
# Now every path is trimmed, judged, and only then sent through the gate.
set -euo pipefail

echo 'B"H Awtsmoos Tunnel Bootstrap'

ROOT="$HOME/.awtsmoos-tunnel"
CONFIG="$ROOT/config.json"
STATE="$ROOT/install-state.txt"
MANIFEST_URL="https://awtsmoos.com/apps/tunnel/agent/manifest.txt"
BASE_URL="https://awtsmoos.com/apps/tunnel/agent"

mkdir -p "$ROOT"
command -v node >/dev/null 2>&1 || { echo "Node.js not found"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl not found"; exit 1; }

if [ ! -f "$CONFIG" ]; then
cat > "$CONFIG" <<EOF
{
  "relay": "wss://awtsmoos.com",
  "tunnelName": "awt-$(whoami)-$RANDOM",
  "local": "http://localhost:3000",
  "root": "$(pwd)",
  "allowWrite": true,
  "allowSecrets": false,
  "enableLocalHttpProxy": true
}
EOF
fi

trim_manifest_lines() {
  printf '%s\n' "$1" |
    sed '1s/^\xEF\xBB\xBF//' |
    awk '{ gsub(/\r/, ""); sub(/^[[:space:]]+/, ""); sub(/[[:space:]]+$/, ""); if ($0 != "" && $0 != "B\"H" && $0 != "# B\"H") print }'
}

assert_safe_manifest_path() {
  file_path="$1"
  if [ -z "$file_path" ]; then echo "Unsafe empty manifest path."; exit 1; fi
  if printf '%s' "$file_path" | grep -Eq '(^/|\.\.|[[:space:]])'; then
    echo "Unsafe manifest path: [$file_path]"
    exit 1
  fi
}

all_manifest_files_exist() {
  [ -f "$ROOT/$ENTRY" ] || return 1
  printf '%s\n' "$FILES" | while IFS= read -r file_path; do
    [ -z "$file_path" ] && continue
    assert_safe_manifest_path "$file_path"
    [ -f "$ROOT/$file_path" ] || exit 7
  done
}

install_awtsmoos_files() {
  printf '%s\n' "$FILES" | while IFS= read -r file_path; do
    [ -z "$file_path" ] && continue
    assert_safe_manifest_path "$file_path"
    mkdir -p "$(dirname "$ROOT/$file_path")"
    echo "Downloading $file_path..."
    if [[ "$file_path" == apps/* ]]; then
  curl -fsSL --retry 3 --retry-delay 1 "https://awtsmoos.com/$file_path" -o "$ROOT/$file_path"
else
  curl -fsSL --retry 3 --retry-delay 1 "$BASE_URL/$file_path" -o "$ROOT/$file_path"
fi
  done
}

MANIFEST="$(curl -fsSL "$MANIFEST_URL")"
LINES="$(trim_manifest_lines "$MANIFEST")"
VERSION="$(printf '%s\n' "$LINES" | sed -n '1p')"
ENTRY="$(printf '%s\n' "$LINES" | sed -n '2p')"
FILES="$(printf '%s\n' "$LINES" | sed '1,2d' || true)"

[ -n "$VERSION" ] && [ -n "$ENTRY" ] || { echo "Manifest is missing version or entry."; exit 1; }
[ "$ENTRY" = "main.js" ] || { echo "Bad manifest entry: $ENTRY"; exit 1; }
[ -n "$FILES" ] || { echo "Manifest has no files."; exit 1; }
assert_safe_manifest_path "$ENTRY"

INSTALLED=""
[ -f "$STATE" ] && INSTALLED="$(tr -d '[:space:]' < "$STATE")"
if [ "$INSTALLED" = "$VERSION" ] && all_manifest_files_exist; then
  echo "Awtsmoos version $VERSION already installed and complete."
else
  if [ "$INSTALLED" = "$VERSION" ]; then
    echo "Repairing incomplete Awtsmoos version $VERSION..."
  else
    echo "Installing Awtsmoos version $VERSION..."
  fi
  install_awtsmoos_files
  printf '%s\n' "$VERSION" > "$STATE"
fi

pkill -f "$ROOT/$ENTRY" 2>/dev/null || true
echo
echo "Starting Awtsmoos background agent..."
node "$ROOT/$ENTRY" --open-control
