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

command -v node >/dev/null 2>&1 || { echo "Node.js is required but was not found."; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl is required but was not found."; exit 1; }

if [ ! -f "$CONFIG" ]; then
  NAME="awt-$(whoami | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9_-')-$((1000 + RANDOM % 9000))"
  cat > "$CONFIG" <<EOF
{
  "BH": "B\"H",
  "relay": "wss://awtsmoos.com",
  "tunnelName": "$NAME",
  "local": "http://localhost:3000",
  "root": "$(pwd)",
  "allowWrite": true,
  "allowSecrets": false,
  "enableLocalHttpProxy": true
}
EOF
else
  echo "Existing config found. Reusing same tunnel name and settings."
fi

echo "Checking Awtsmoos agent manifest..."
MANIFEST="$(curl -fsSL "$MANIFEST_URL")"
VERSION="$(printf '%s\n' "$MANIFEST" | sed '/^[[:space:]]*$/d' | sed -n '2p')"
ENTRY="$(printf '%s\n' "$MANIFEST" | sed '/^[[:space:]]*$/d' | sed -n '3p')"
FILES="$(printf '%s\n' "$MANIFEST" | sed '/^[[:space:]]*$/d' | sed '1,3d')"

OLD_VERSION=""
[ -f "$STATE" ] && OLD_VERSION="$(cat "$STATE" | tr -d '[:space:]')"

if [ "$OLD_VERSION" = "$VERSION" ] && [ -f "$ROOT/$ENTRY" ]; then
  echo "Awtsmoos agent version $VERSION is already installed. Restarting only."
else
  echo "Installing Awtsmoos agent version $VERSION..."

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