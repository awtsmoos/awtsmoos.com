
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
CONFIG="$ROOT/config.json"
MANIFEST_URL="https://awtsmoos.com/apps/tunnel/agent/manifest.json"

mkdir -p "$ROOT"

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
  enableLocalHttpProxy: true,
  chrome: {
    enabled: false,
    port: 9222,
    path: "",
    userDataDir: ""
  }
}, null, 2), "utf8");
NODE
else
  echo "Existing config found. Reusing same tunnel name and settings."
fi

echo "Downloading Awtsmoos agent manifest..."
MANIFEST="$(curl -fsSL "$MANIFEST_URL")"

node - "$ROOT" "$MANIFEST" <<'NODE'
const fs = require("fs");
const path = require("path");
const https = require("https");

const root = process.argv[2];
const manifest = JSON.parse(process.argv[3]);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);

    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error("HTTP " + res.statusCode + " for " + url));
        return;
      }

      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

(async () => {
  for (const file of manifest.files) {
    const url = "https://awtsmoos.com/apps/tunnel/agent/" + file.path;
    const dest = path.join(root, file.path);
    console.log("Downloading " + file.path + "...");
    await download(url, dest);
  }
})();
NODE

echo ""
echo "Starting Awtsmoos background agent..."
echo "The hosted control panel should open automatically."
echo ""

node "$ROOT/main.js" --open-control
