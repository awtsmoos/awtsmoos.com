
// B"H

/**
 * B"H
 * Unix/macOS installer for Awtsmoos Tunnel.
 *
 * @returns {string} Bash installer script.
 */
function unixInstaller() {
  return String.raw`#!/usr/bin/env bash
# B"H

set -e

echo 'B"H Awtsmoos Tunnel Installer'

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found."
  echo "Install Node.js LTS from https://nodejs.org/ then run this again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Install Node.js LTS from https://nodejs.org/ then run this again."
  exit 1
fi

ROOT="$HOME/.awtsmoos-tunnel"
CLIENT="$ROOT/awtsmoos-tunnel-client.js"
CONFIG="$ROOT/config.json"
PACKAGE="$ROOT/package.json"

mkdir -p "$ROOT"

if [ -f "$CLIENT" ]; then
  pkill -f "node $CLIENT" >/dev/null 2>&1 || true
fi

echo "Downloading latest tunnel client..."
curl -fsSL "https://awtsmoos.com/api/tunnel/install/client" -o "$CLIENT"

if [ ! -f "$PACKAGE" ]; then
  printf '%s\n' '{"dependencies":{"ws":"latest"}}' > "$PACKAGE"
fi

cd "$ROOT"
echo "Installing/updating ws dependency..."
npm install --silent

if [ -f "$CONFIG" ]; then
  echo ""
  echo "Existing config found at $CONFIG"
  echo "Press ENTER to reuse and start, or type R to reconfigure:"
  read AGAIN

  if [ "$AGAIN" != "R" ] && [ "$AGAIN" != "r" ]; then
    echo "Starting Awtsmoos tunnel with existing config..."
    node "$CLIENT"
    exit 0
  fi
fi

DEFAULT_NAME="awt-$(whoami)-$RANDOM"
printf "Tunnel name [%s]: " "$DEFAULT_NAME"
read TUNNEL_NAME
if [ -z "$TUNNEL_NAME" ]; then
  TUNNEL_NAME="$DEFAULT_NAME"
fi

DEFAULT_PROJECT="$(pwd)"
printf "Project folder to expose [%s]: " "$DEFAULT_PROJECT"
read PROJECT_ROOT
if [ -z "$PROJECT_ROOT" ]; then
  PROJECT_ROOT="$DEFAULT_PROJECT"
fi

printf "Allow writing files? Type YES to allow, anything else for read-only: "
read WRITE_ANSWER
ALLOW_WRITE=false
if [ "$WRITE_ANSWER" = "YES" ]; then
  ALLOW_WRITE=true
fi

cat > "$CONFIG" <<EOF
{
  "relay": "wss://awtsmoos.com",
  "tunnelName": "$TUNNEL_NAME",
  "local": "http://localhost:3000",
  "root": "$PROJECT_ROOT",
  "allowWrite": $ALLOW_WRITE
}
EOF

echo ""
echo "B\"H tunnel config saved to $CONFIG"
echo "Starting tunnel..."
echo ""
echo "Paste into your GPT:"
echo "tunnelName: $TUNNEL_NAME"
echo "project path: ."
echo ""

node "$CLIENT"
`;
}

module.exports = { unixInstaller };
