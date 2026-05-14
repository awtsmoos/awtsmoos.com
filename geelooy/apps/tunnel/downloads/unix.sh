
#!/usr/bin/env bash
# B"H

set -e

echo 'B"H Awtsmoos Tunnel Installer'

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found."
  echo "Install Node.js LTS from https://nodejs.org/ then run this again."
  exit 1
fi

ROOT="$HOME/.awtsmoos-tunnel"
CLIENT="$ROOT/awtsmoos-tunnel-client.js"
CONFIG="$ROOT/config.json"

OLD_TUNNEL_NAME=""
OLD_PROJECT_ROOT=""
OLD_ALLOW_WRITE="true"

if [ -f "$CONFIG" ]; then
  OLD_TUNNEL_NAME="$(node -e "try{let c=require(process.argv[1]); console.log(c.tunnelName||'')}catch(e){}" "$CONFIG")"
  OLD_PROJECT_ROOT="$(node -e "try{let c=require(process.argv[1]); console.log(c.root||'')}catch(e){}" "$CONFIG")"
  OLD_ALLOW_WRITE="$(node -e "try{let c=require(process.argv[1]); console.log(c.allowWrite===false?'false':'true')}catch(e){console.log('true')}" "$CONFIG")"
fi

if [ -f "$CLIENT" ]; then
  pkill -f "node $CLIENT" >/dev/null 2>&1 || true
fi

if [ -d "$ROOT" ]; then
  echo "Cleaning old tunnel folder..."
  rm -rf "$ROOT"
fi

mkdir -p "$ROOT"

echo "Downloading latest tunnel client..."
curl -fsSL "https://awtsmoos.com/api/tunnel/install/client" -o "$CLIENT"

USER_CLEAN="$(whoami | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_-]/-/g' | sed 's/^-*//;s/-*$//')"
if [ -z "$USER_CLEAN" ]; then
  USER_CLEAN="user"
fi

DEFAULT_NAME="awt-$USER_CLEAN-$RANDOM"
DEFAULT_PROJECT="$(pwd)"
DEFAULT_WRITE="$OLD_ALLOW_WRITE"

if [ -n "$OLD_TUNNEL_NAME" ]; then
  DEFAULT_NAME="$OLD_TUNNEL_NAME"
fi

if [ -n "$OLD_PROJECT_ROOT" ]; then
  DEFAULT_PROJECT="$OLD_PROJECT_ROOT"
fi

printf "Tunnel name [%s]: " "$DEFAULT_NAME"
read TUNNEL_NAME
if [ -z "$TUNNEL_NAME" ]; then
  TUNNEL_NAME="$DEFAULT_NAME"
fi

printf "Project folder to expose [%s]: " "$DEFAULT_PROJECT"
read PROJECT_ROOT
if [ -z "$PROJECT_ROOT" ]; then
  PROJECT_ROOT="$DEFAULT_PROJECT"
fi

DEFAULT_WRITE_LABEL="Y"
if [ "$DEFAULT_WRITE" = "false" ]; then
  DEFAULT_WRITE_LABEL="N"
fi

printf "Allow writing files? Y/n [%s]: " "$DEFAULT_WRITE_LABEL"
read WRITE_ANSWER

ALLOW_WRITE="$DEFAULT_WRITE"

if [ -z "$WRITE_ANSWER" ]; then
  ALLOW_WRITE="$DEFAULT_WRITE"
else
  case "$(echo "$WRITE_ANSWER" | tr '[:upper:]' '[:lower:]')" in
    y|yes|true|1)
      ALLOW_WRITE=true
      ;;
    *)
      ALLOW_WRITE=false
      ;;
  esac
fi

node - "$CONFIG" "$TUNNEL_NAME" "$PROJECT_ROOT" "$ALLOW_WRITE" <<'NODE'
const fs = require("fs");
const [configPath, tunnelName, root, allowWriteRaw] = process.argv.slice(2);
const config = {
  relay: "wss://awtsmoos.com",
  tunnelName,
  local: "http://localhost:3000",
  root,
  allowWrite: allowWriteRaw === "true"
};
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
NODE

echo ""
echo 'B"H tunnel config saved.'
echo "$CONFIG"
echo "Starting tunnel..."
echo ""
echo "Paste into your GPT:"
echo "tunnelName: $TUNNEL_NAME"
echo "project path: ."
echo ""

node "$CLIENT"
