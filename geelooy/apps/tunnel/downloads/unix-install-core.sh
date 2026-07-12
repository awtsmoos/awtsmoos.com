#!/usr/bin/env bash
# B"H
set -euo pipefail

origin="${AWTSMOOS_INSTALL_ORIGIN%/}"
ROOT="$AWTSMOOS_INSTALL_ROOT"
CONFIG="$ROOT/config.json"
STATE="$ROOT/install-state.txt"
MANIFEST_STATE="$ROOT/install-manifest.sha256"
MANIFEST_COPY="$ROOT/installed-manifest.txt"
MANIFEST_URL="$origin/apps/tunnel/agent/manifest.txt"
ENTRY='main.js'
PID_FILE="$ROOT/agent.pid"
SUP_PID_FILE="$ROOT/supervisor.pid"
SUPERVISOR="$ROOT/awtsmoos-supervisor.sh"
STOP_FILE="$ROOT/stop-supervisor"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-cleanup.sh"
source "$AWTSMOOS_INSTALL_RUNTIME/unix-process-control.sh"
cleanup_disposable_state "$(pwd)"
mkdir -p "$ROOT"

if [ ! -f "$CONFIG" ]; then
	cat > "$CONFIG" <<JSON
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
JSON
fi
project_root="$(node -e "try{const c=require('$CONFIG');console.log(c.root||process.cwd())}catch{console.log(process.cwd())}")"
cleanup_disposable_state "$project_root"

trim_manifest_lines() {
	printf '%s\n' "$1" | sed '1s/^\xEF\xBB\xBF//' | awk '{gsub(/\r/,"");sub(/^[[:space:]]+/,"");sub(/[[:space:]]+$/,"");if($0!=""&&$0!="B\"H"&&$0!="# B\"H")print}'
}

manifest_hash() {
	printf '%s' "$1" | node -e "const c=require('crypto');let d='';process.stdin.on('data',x=>d+=x);process.stdin.on('end',()=>console.log(c.createHash('sha256').update(d).digest('hex')));"
}

assert_safe_manifest_path() {
	file_path="$1"
	[ -n "$file_path" ] || { echo 'Unsafe empty manifest path.'; exit 1; }
	printf '%s' "$file_path" | grep -Eq '(^/|\.\.|[[:space:]])' && { echo "Unsafe manifest path: [$file_path]"; exit 1; } || true
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
	else echo 'No unzip or python3 found.'; return 1
	fi
}

assert_zip_signature() {
	node - "$1" <<'NODE'
const fs=require('fs');const fd=fs.openSync(process.argv[2],'r');const b=Buffer.alloc(4);try{fs.readSync(fd,b,0,4,0)}finally{fs.closeSync(fd)}if(b.toString('hex')!=='504b0304')process.exit(1);
NODE
}

install_awtsmoos_bundles() {
	tmp="$ROOT/.bundle-downloads"
	rm -rf "$tmp"
	mkdir -p "$tmp"
	curl -fsSL --retry 3 --retry-delay 1 "$origin/api/tunnel/install/bundle-manifest" -o "$tmp/bundles.json"
	node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));if(!j.bundles?.length)process.exit(2);for(const b of j.bundles)console.log(b.name+' '+b.url);" "$tmp/bundles.json" > "$tmp/bundles.txt"
	while read -r name url; do
		[ -z "$name" ] && continue
		case "$url" in http*) full="$url" ;; *) full="$origin$url" ;; esac
		zip_file="$tmp/$name.zip"
		curl -fsSL --retry 3 --retry-delay 1 "$full" -o "$zip_file"
		assert_zip_signature "$zip_file" || { echo "Bundle $name is not ZIP"; exit 1; }
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
[ -n "$VERSION" ] && [ "$ENTRY" = 'main.js' ] && [ -n "$FILES" ] || { echo 'Manifest invalid.'; exit 1; }
INSTALLED=""; INSTALLED_HASH=""; UPDATED=0
[ -f "$STATE" ] && INSTALLED="$(tr -d '[:space:]' < "$STATE")"
[ -f "$MANIFEST_STATE" ] && INSTALLED_HASH="$(tr -d '[:space:]' < "$MANIFEST_STATE")"
if [ "$INSTALLED" = "$VERSION" ] && [ "$INSTALLED_HASH" = "$HASH" ] && all_manifest_files_exist; then
	echo "Awtsmoos version $VERSION already installed and complete."
else
	UPDATED=1
	install_awtsmoos_bundles
	all_manifest_files_exist || { echo 'Bundle install verification failed.'; exit 1; }
	printf '%s\n' "$VERSION" > "$STATE"
	printf '%s\n' "$HASH" > "$MANIFEST_STATE"
	printf '%s\n' "$LINES" > "$MANIFEST_COPY"
fi
cleanup_disposable_state "$project_root"
cleanup_disposable_state "$(pwd)"
if [ "${AWTSMOOS_SKIP_START:-}" = '1' ] || [ "${AWTSMOOS_SKIP_START:-}" = 'true' ]; then echo 'AWTSMOOS_SKIP_START set; install verified without starting agent.'; exit 0; fi
if [ "$UPDATED" = '1' ] || [ "${AWTSMOOS_RESTART:-}" = '1' ] || [ "${AWTSMOOS_RESTART:-}" = 'true' ]; then stop_existing_runtime; fi
start_supervisor
echo 'Awtsmoos installer complete. The agent is supervised in the background.'
