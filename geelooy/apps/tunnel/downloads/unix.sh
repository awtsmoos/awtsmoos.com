
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
AGENT="$ROOT/awtsmoos-agent.js"
CONFIG="$ROOT/config.json"

mkdir -p "$ROOT"

echo "Downloading latest Awtsmoos agent..."
curl -fsSL "https://awtsmoos.com/api/tunnel/install/agent" -o "$AGENT"

if [ ! -f "$CONFIG" ]; then
  USER_CLEAN="$(whoami | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_-]/-/g' | sed 's/^-*//;s/-*$//')"
  if [ -z "$USER_CLEAN" ]; then USER_CLEAN="user"; fi
  TUNNEL_NAME="awt-$USER_CLEAN-$RANDOM"

  node - "$CONFIG" "$TUNNEL_NAME" "$(pwd)" <<'NODE'
const fs = require("fs");
const [configPath, tunnelName, root] = process.argv.slice(2);
fs.writeFileSync(configPath, JSON.stringify({
  relay: "wss://awtsmoos.com",
  tunnelName,
  local: "http://localhost:3000",
  root,
  allowWrite: true,
  allowSecrets: false,
  enableLocalHttpProxy: true
}, null, 2), "utf8");
NODE
fi

echo ""
echo "Starting Awtsmoos background agent..."
echo "The hosted control panel should open automatically."
echo ""

node "$AGENT" --open-control
