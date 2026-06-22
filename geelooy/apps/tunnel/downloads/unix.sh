#!/usr/bin/env bash
# B"H
set -euo pipefail

echo 'B"H Awtsmoos Tunnel Bootstrap'

origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
ROOT="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
CONFIG="$ROOT/config.json"
STATE="$ROOT/install-state.txt"
MANIFEST_STATE="$ROOT/install-manifest.sha256"
MANIFEST_COPY="$ROOT/installed-manifest.txt"
MANIFEST_URL="$origin/apps/tunnel/agent/manifest.txt"
BASE_URL="$origin/apps/tunnel/agent"

mkdir -p "$ROOT"
command -v node >/dev/null 2>&1 || { echo "Node.js not found"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl not found"; exit 1; }

if [ ! -f "$CONFIG" ]; then
cat > "$CONFIG" <<EOF
{
  "relay": "${AWTSMOOS_RELAY:-wss://awtsmoos.com}",
  "tunnelName": "${AWTSMOOS_TUNNEL_NAME:-awt-$(whoami)-$RANDOM}",
  "local": "${AWTSMOOS_LOCAL:-http://localhost:3000}",
  "root": "${AWTSMOOS_PROJECT_ROOT:-$(pwd)}",
  "allowWrite": true,
  "allowSecrets": false,
  "enableLocalHttpProxy": true,
  "localApi": { "enabled": true, "host": "127.0.0.1", "port": ${AWTSMOOS_LOCAL_API_PORT:-3977} }
}
EOF
fi

trim_manifest_lines() {
  printf '%s\n' "$1" | sed '1s/^\xEF\xBB\xBF//' | awk '{ gsub(/\r/, ""); sub(/^[[:space:]]+/, ""); sub(/[[:space:]]+$/, ""); if ($0 != "" && $0 != "B\"H" && $0 != "# B\"H") print }'
}

manifest_hash() {
  if command -v shasum >/dev/null 2>&1; then printf '%s' "$1" | shasum -a 256 | awk '{print $1}';
  elif command -v sha256sum >/dev/null 2>&1; then printf '%s' "$1" | sha256sum | awk '{print $1}';
  else printf '%s' "$1" | node -e "const c=require('crypto');let d='';process.stdin.on('data',x=>d+=x);process.stdin.on('end',()=>console.log(c.createHash('sha256').update(d).digest('hex')));"; fi
}

assert_safe_manifest_path() {
  file_path="$1"
  if [ -z "$file_path" ]; then echo "Unsafe empty manifest path."; exit 1; fi
  if printf '%s' "$file_path" | grep -Eq '(^/|\.\.|[[:space:]])'; then echo "Unsafe manifest path: [$file_path]"; exit 1; fi
}

all_manifest_files_exist() {
  [ -f "$ROOT/$ENTRY" ] || return 1
  printf '%s\n' "$FILES" | while IFS= read -r file_path; do
    [ -z "$file_path" ] && continue
    assert_safe_manifest_path "$file_path"
    [ -f "$ROOT/$file_path" ] || exit 7
  done
}

extract_zip() {
  zip_file="$1"
  if command -v unzip >/dev/null 2>&1; then unzip -o "$zip_file" -d "$ROOT" >/dev/null
  elif command -v python3 >/dev/null 2>&1; then python3 -m zipfile -e "$zip_file" "$ROOT"
  else echo "No unzip or python3 found for bundle extraction."; return 1
  fi
}

install_awtsmoos_bundles() {
  tmp="$ROOT/.bundle-downloads"
  rm -rf "$tmp"; mkdir -p "$tmp"
  echo "Installing from Awtsmoos ZIP bundle..."
  curl -fsSL --retry 3 --retry-delay 1 "$origin/api/tunnel/install/bundle-manifest" -o "$tmp/bundles.json"
  node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(!j.bundles||!j.bundles.length) process.exit(2); for(const b of j.bundles) console.log(b.name+' '+b.url);" "$tmp/bundles.json" > "$tmp/bundles.txt"
  while read -r name url; do
    [ -z "$name" ] && continue
    zip_file="$tmp/$name.zip"
    echo "Downloading bundle $name..."
    case "$url" in http*) full="$url" ;; *) full="$origin$url" ;; esac
    curl -fsSL --retry 3 --retry-delay 1 "$full" -o "$zip_file"
    echo "Expanding bundle $name..."
    extract_zip "$zip_file"
  done < "$tmp/bundles.txt"
  rm -rf "$tmp"
}

MANIFEST="$(curl -fsSL "$MANIFEST_URL")"
LINES="$(trim_manifest_lines "$MANIFEST")"
VERSION="$(printf '%s\n' "$LINES" | sed -n '1p')"
ENTRY="$(printf '%s\n' "$LINES" | sed -n '2p')"
FILES="$(printf '%s\n' "$LINES" | sed '1,2d' || true)"
HASH="$(manifest_hash "$LINES")"

[ -n "$VERSION" ] && [ -n "$ENTRY" ] || { echo "Manifest is missing version or entry."; exit 1; }
[ "$ENTRY" = "main.js" ] || { echo "Bad manifest entry: $ENTRY"; exit 1; }
[ -n "$FILES" ] || { echo "Manifest has no files."; exit 1; }
assert_safe_manifest_path "$ENTRY"

INSTALLED=""; INSTALLED_HASH=""
[ -f "$STATE" ] && INSTALLED="$(tr -d '[:space:]' < "$STATE")"
[ -f "$MANIFEST_STATE" ] && INSTALLED_HASH="$(tr -d '[:space:]' < "$MANIFEST_STATE")"
if [ "$INSTALLED" = "$VERSION" ] && [ "$INSTALLED_HASH" = "$HASH" ] && all_manifest_files_exist; then
  echo "Awtsmoos version $VERSION manifest $HASH already installed and complete."
else
  if [ "$INSTALLED" = "$VERSION" ]; then echo "Repairing Awtsmoos version $VERSION because manifest changed/incomplete..."; else echo "Installing Awtsmoos version $VERSION..."; fi
  install_awtsmoos_bundles
  all_manifest_files_exist || { echo "Bundle install verification failed. No file fallback is available by policy."; exit 1; }
  printf '%s\n' "$VERSION" > "$STATE"
  printf '%s\n' "$HASH" > "$MANIFEST_STATE"
  printf '%s\n' "$LINES" > "$MANIFEST_COPY"
fi

if [ "${AWTSMOOS_SKIP_START:-}" = "1" ] || [ "${AWTSMOOS_SKIP_START:-}" = "true" ]; then echo "AWTSMOOS_SKIP_START set; install verified without starting agent."; exit 0; fi
pkill -f "$ROOT/$ENTRY" 2>/dev/null || true
echo
echo "Starting Awtsmoos background agent..."
if [ "${AWTSMOOS_SKIP_OPEN_CONTROL:-}" = "1" ] || [ "${AWTSMOOS_SKIP_OPEN_CONTROL:-}" = "true" ]; then node "$ROOT/$ENTRY"; else node "$ROOT/$ENTRY" --open-control; fi
