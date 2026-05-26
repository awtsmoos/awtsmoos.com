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
STATE="$ROOT/install-state.json"
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

echo "Checking Awtsmoos agent manifest..."
MANIFEST="$(curl -fsSL "$MANIFEST_URL")"

node - "$ROOT" "$MANIFEST" <<'NODE'
const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

const root = process.argv[2];
const manifest = JSON.parse(process.argv[3]);
const statePath = path.join(root, "install-state.json");

function readState() {
  try { return JSON.parse(fs.readFileSync(statePath, "utf8")); }
  catch (_) { return null; }
}

function fileMatches(file) {
  const target = path.join(root, file.path);
  if (!fs.existsSync(target)) return false;
  const bytes = fs.readFileSync(target);
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  return bytes.length === file.bytes && sha === file.sha256;
}

function changedFiles() {
  if (!Array.isArray(manifest.files)) return [];
  return manifest.files.filter(file => !fileMatches(file));
}

function installedFilesMatch() {
  return changedFiles().length === 0;
}

function compareVersion(a, b) {
  const left = String(a || "").split(".").map(Number);
  const right = String(b || "").split(".").map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const x = Number.isFinite(left[i]) ? left[i] : 0;
    const y = Number.isFinite(right[i]) ? right[i] : 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function upToDate(state) {
  if (!state || !state.version) return false;
  if (!fs.existsSync(path.join(root, manifest.entry || "main.js"))) return false;
  if (!installedFilesMatch()) return false;
  return compareVersion(state.version, manifest.version) >= 0;
}

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

function writeState() {
  fs.writeFileSync(statePath, JSON.stringify({
    BH: 'B"H',
    version: manifest.version,
    entry: manifest.entry,
    installedAt: new Date().toISOString(),
    files: manifest.files
  }, null, 2), "utf8");
}

(async () => {
  const state = readState();
  if (upToDate(state)) {
    console.log("Awtsmoos agent version " + manifest.version + " is already installed. Restarting only.");
    return;
  }

  const changed = changedFiles();
  if (changed.length === 0) {
    console.log("Agent files already match manifest. Recording version " + manifest.version + " without downloads.");
    writeState();
    return;
  }

  console.log("Updating Awtsmoos agent to version " + manifest.version + ": " + changed.length + " changed file(s)...");
  for (const file of changed) {
    const url = "https://awtsmoos.com/apps/tunnel/agent/" + file.path;
    const dest = path.join(root, file.path);
    console.log("Downloading " + file.path + "...");
    await download(url, dest);
    if (!fileMatches(file)) throw new Error("Downloaded hash mismatch for " + file.path);
  }
  writeState();
})();
NODE

echo ""
echo "Starting Awtsmoos background agent..."
echo "The hosted control panel should open automatically."
echo ""

node "$ROOT/main.js" --open-control
