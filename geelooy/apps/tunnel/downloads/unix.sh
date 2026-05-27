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

command -v node >/dev/null 2>&1 || {
  echo "Node.js not found"
  exit 1
}

command -v curl >/dev/null 2>&1 || {
  echo "curl not found"
  exit 1
}

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

MANIFEST="$(curl -fsSL "$MANIFEST_URL")"

LINES="$(printf '%s\n' "$MANIFEST" | sed '/^[[:space:]]*$/d')"

VERSION="$(printf '%s\n' "$LINES" | sed -n '2p')"
ENTRY="$(printf '%s\n' "$LINES" | sed -n '3p')"
FILES="$(printf '%s\n' "$LINES" | sed '1,3d')"

INSTALLED=""

[ -f "$STATE" ] && INSTALLED="$(cat "$STATE" | tr -d '[:space:]')"

if [ "$INSTALLED" = "$VERSION" ] && [ -f "$ROOT/$ENTRY" ]; then
  echo "Awtsmoos version $VERSION already installed."
else
  echo "Installing Awtsmoos version $VERSION..."

  printf '%s\n' "$FILES" | while IFS= read -r path; do
    [ -z "$path" ] && continue

    mkdir -p "$(dirname "$ROOT/$path")"

    echo "Downloading $path..."

    curl -fsSL "$BASE_URL/$path" -o "$ROOT/$path"
  done

  printf '%s\n' "$VERSION" > "$STATE"
fi

pkill -f "$ROOT/$ENTRY" 2>/dev/null || true

echo
echo "Starting Awtsmoos background agent..."

node "$ROOT/$ENTRY" --open-control
