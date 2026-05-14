
#!/usr/bin/env bash
# B"H

set -e

echo 'B"H Awtsmoos Tunnel Bootstrap'

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found."
  echo "Install Node.js LTS from https://nodejs.org/ then run this again."
  exit 1
fi

ROOT="$HOME/.awtsmoos-tunnel"
APP="$ROOT/awtsmoos-local-app.js"
STAMP="$ROOT/last-bootstrap.txt"

mkdir -p "$ROOT"

echo "Downloading latest Awtsmoos local control app..."
curl -fsSL "https://awtsmoos.com/api/tunnel/install/local-app" -o "$APP"

date > "$STAMP"

echo ""
echo "Starting Awtsmoos local control panel..."
echo "The browser should open automatically."
echo ""

node "$APP"
