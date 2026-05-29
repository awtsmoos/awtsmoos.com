#!/usr/bin/env bash
# B"H

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

manifest_lines() {
  printf '%s\n' "$1" | sed 's/^\xEF\xBB\xBF//' | sed '/^[[:space:]]*$/d' | grep -v '^B"H$' | grep -v '^# B"H$'
}

all_manifest_files_exist() {
  [ -f "$ROOT/$ENTRY" ] || return 1
  printf '%s\n' "$FILES" | while IFS= read -r file_path; do
    [ -z "$file_path" ] && continue
    [ -f "$ROOT/$file_path" ] || exit 7
  done
}

install_awtsmoos_files() {
  printf '%s\n' "$FILES" | while IFS= read -r file_path; do
    [ -z "$file_path" ] && continue
    mkdir -p "$(dirname "$ROOT/$file_path")"
    echo "Downloading $file_path..."
    curl -fsSL "$BASE_URL/$file_path" -o "$ROOT/$file_path"
  done
}

MANIFEST="$(curl -fsSL "$MANIFEST_URL")"
LINES="$(manifest_lines "$MANIFEST")"
VERSION="$(printf '%s\n' "$LINES" | sed -n '1p')"
ENTRY="$(printf '%s\n' "$LINES" | sed -n '2p')"
FILES="$(printf '%s\n' "$LINES" | sed '1,2d' | grep -v '^manifest\.json$' | grep -v '^manifest\.txt$' || true)"

if [ -z "$VERSION" ] || [ -z "$ENTRY" ]; then
  echo "Manifest is missing version or entry."
  exit 1
fi

if [ "$ENTRY" != "main.js" ]; then
  echo "Bad manifest entry: $ENTRY"
  exit 1
fi

if [ -z "$FILES" ]; then
  echo "Manifest has no files."
  exit 1
fi

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
