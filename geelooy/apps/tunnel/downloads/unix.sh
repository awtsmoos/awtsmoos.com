#!/usr/bin/env bash
# B"H
set -euo pipefail

echo 'B"H Awtsmoos Tunnel Bootstrap'
origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"; origin="${origin%/}"
ROOT="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
CONFIG="$ROOT/config.json"; STATE="$ROOT/install-state.txt"; MANIFEST_STATE="$ROOT/install-manifest.sha256"; MANIFEST_COPY="$ROOT/installed-manifest.txt"
MANIFEST_URL="$origin/apps/tunnel/agent/manifest.txt"; ENTRY="main.js"; PID_FILE="$ROOT/agent.pid"; SUP_PID_FILE="$ROOT/supervisor.pid"; SUPERVISOR="$ROOT/awtsmoos-supervisor.sh"; STOP_FILE="$ROOT/stop-supervisor"
mkdir -p "$ROOT"
command -v node >/dev/null 2>&1 || { echo "Node.js not found"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl not found"; exit 1; }

cleanup_disposable_state() {
  base="$1/.awtsmoos"; [ -d "$base" ] || return 0
  for name in tmp-install-tests tmp-installed-agent-smoke tmp .bundle-downloads; do [ -e "$base/$name" ] && { echo "Cleaning disposable Awtsmoos state: $base/$name"; rm -rf "$base/$name" || true; }; done
  find "$base" -maxdepth 1 -type d \( -name '.self-update-*' -o -name 'self-update-*' -o -name 'tmp-install-*' -o -name 'tmp-smoke-*' \) -print -exec rm -rf {} + 2>/dev/null || true
}
cleanup_disposable_state "$(pwd)"

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
project_root="$(node -e "try{const c=require('$CONFIG'); console.log(c.root||process.cwd())}catch(e){console.log(process.cwd())}")"
cleanup_disposable_state "$project_root"

trim_manifest_lines() { printf '%s\n' "$1" | sed '1s/^\xEF\xBB\xBF//' | awk '{ gsub(/\r/, ""); sub(/^[[:space:]]+/, ""); sub(/[[:space:]]+$/, ""); if ($0 != "" && $0 != "B\"H" && $0 != "# B\"H") print }'; }
manifest_hash() { if command -v shasum >/dev/null 2>&1; then printf '%s' "$1" | shasum -a 256 | awk '{print $1}'; elif command -v sha256sum >/dev/null 2>&1; then printf '%s' "$1" | sha256sum | awk '{print $1}'; else printf '%s' "$1" | node -e "const c=require('crypto');let d='';process.stdin.on('data',x=>d+=x);process.stdin.on('end',()=>console.log(c.createHash('sha256').update(d).digest('hex')));"; fi; }
assert_safe_manifest_path() { file_path="$1"; [ -n "$file_path" ] || { echo "Unsafe empty manifest path."; exit 1; }; printf '%s' "$file_path" | grep -Eq '(^/|\.\.|[[:space:]])' && { echo "Unsafe manifest path: [$file_path]"; exit 1; } || true; }
all_manifest_files_exist() { [ -f "$ROOT/$ENTRY" ] || return 1; printf '%s\n' "$FILES" | while IFS= read -r file_path; do [ -z "$file_path" ] && continue; assert_safe_manifest_path "$file_path"; [ -f "$ROOT/$file_path" ] || exit 7; done; }
extract_zip() { zip_file="$1"; if command -v unzip >/dev/null 2>&1; then unzip -o "$zip_file" -d "$ROOT" >/dev/null; elif command -v python3 >/dev/null 2>&1; then python3 -m zipfile -e "$zip_file" "$ROOT"; else echo "No unzip or python3 found."; return 1; fi; }
assert_zip_signature() { node - "$1" <<'NODE'
const fs=require('fs'); const fd=fs.openSync(process.argv[2],'r'); const b=Buffer.alloc(4); try{fs.readSync(fd,b,0,4,0)}finally{fs.closeSync(fd)} if(b.toString('hex')!=='504b0304') process.exit(1);
NODE
}
install_awtsmoos_bundles() { tmp="$ROOT/.bundle-downloads"; rm -rf "$tmp"; mkdir -p "$tmp"; echo "Installing from Awtsmoos ZIP bundle..."; curl -fsSL --retry 3 --retry-delay 1 "$origin/api/tunnel/install/bundle-manifest" -o "$tmp/bundles.json"; node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(!j.bundles||!j.bundles.length) process.exit(2); for(const b of j.bundles) console.log(b.name+' '+b.url);" "$tmp/bundles.json" > "$tmp/bundles.txt"; while read -r name url; do [ -z "$name" ] && continue; zip_file="$tmp/$name.zip"; echo "Downloading bundle $name..."; case "$url" in http*) full="$url" ;; *) full="$origin$url" ;; esac; curl -fsSL --retry 3 --retry-delay 1 "$full" -o "$zip_file"; assert_zip_signature "$zip_file" || { echo "Bundle $name is not ZIP"; exit 1; }; echo "Expanding bundle $name..."; extract_zip "$zip_file"; done < "$tmp/bundles.txt"; rm -rf "$tmp"; }
write_supervisor() { cat > "$SUPERVISOR" <<'SUP'
#!/usr/bin/env bash
# B"H Awtsmoos forever supervisor
set -u
ROOT="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"; ENTRY="${AWTSMOOS_ENTRY:-main.js}"; PID_FILE="$ROOT/agent.pid"; SUP_PID_FILE="$ROOT/supervisor.pid"; LOG_FILE="$ROOT/agent-supervisor.log"; STOP_FILE="$ROOT/stop-supervisor"; MIN_SLEEP="${AWTSMOOS_SUPERVISOR_MIN_SLEEP:-1}"; MAX_SLEEP="${AWTSMOOS_SUPERVISOR_MAX_SLEEP:-30}"
mkdir -p "$ROOT"; echo $$ > "$SUP_PID_FILE"; rm -f "$STOP_FILE"
log(){ printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >> "$LOG_FILE"; }
is_alive(){ [ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null; }
process_table(){ LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true; }
find_agent_pids(){ process_table | awk -v self="$$" -v needle="$ROOT/$ENTRY" '{ pid=$1; line=$0; sub(/^[[:space:]]*[0-9]+[[:space:]]+/, "", line); if (pid == self) next; if (index(line, "node " needle) > 0 || index(line, "/node " needle) > 0) print pid; }' || true; }
find_agent_pid(){ find_agent_pids | head -1 || true; }
adopted="${AWTSMOOS_ADOPT_PID:-}"; if ! is_alive "$adopted"; then adopted="$(find_agent_pid)"; fi; if is_alive "$adopted"; then echo "$adopted" > "$PID_FILE"; log "adopted existing agent pid $adopted"; fi
sleep_for="$MIN_SLEEP"
while [ ! -f "$STOP_FILE" ]; do pid=""; [ -f "$PID_FILE" ] && pid="$(cat "$PID_FILE" 2>/dev/null || true)"; if is_alive "$pid"; then sleep 2; continue; fi; extant="$(find_agent_pid)"; if is_alive "$extant"; then echo "$extant" > "$PID_FILE"; log "adopted discovered agent pid $extant"; sleep 2; continue; fi; log "starting agent"; nohup node "$ROOT/$ENTRY" >> "$ROOT/agent.log" 2>&1 & pid=$!; echo "$pid" > "$PID_FILE"; log "agent pid $pid started"; sleep "$sleep_for"; if is_alive "$pid"; then sleep_for="$MIN_SLEEP"; else sleep_for=$((sleep_for*2)); [ "$sleep_for" -gt "$MAX_SLEEP" ] && sleep_for="$MAX_SLEEP"; fi; done
log "stop file present; supervisor exiting"
SUP
chmod +x "$SUPERVISOR"; }
is_alive() { [ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null; }
process_table() { LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true; }
find_agent_pids() { process_table | awk -v self="$$" -v needle="$ROOT/$ENTRY" '{ pid=$1; line=$0; sub(/^[[:space:]]*[0-9]+[[:space:]]+/, "", line); if (pid == self) next; if (index(line, "node " needle) > 0 || index(line, "/node " needle) > 0) print pid; }' || true; }
find_agent_pid() { find_agent_pids | head -1 || true; }
find_supervisor_pids() { process_table | awk -v self="$$" -v sup="$SUPERVISOR" '{ pid=$1; line=$0; sub(/^[[:space:]]*[0-9]+[[:space:]]+/, "", line); if (pid == self) next; if (line == sup || index(line, "bash " sup) > 0 || index(line, "/bash " sup) > 0 || index(line, "env bash " sup) > 0) print pid; }' || true; }
find_supervisor_pid() { find_supervisor_pids | head -1 || true; }
wait_for_pids_to_exit() { label="$1"; shift || true; pids="$*"; [ -z "$pids" ] && return 0; for _ in 1 2 3 4 5; do alive=""; for pid in $pids; do is_alive "$pid" && alive="$alive $pid"; done; [ -z "$alive" ] && return 0; sleep 0.1; done; for pid in $pids; do is_alive "$pid" && { echo "Force killing stale Awtsmoos $label PID: $pid"; kill -9 "$pid" 2>/dev/null || true; }; done; }
stop_existing_runtime() { write_supervisor; agent_pids="$(find_agent_pids | tr '\n' ' ')"; supervisor_pids="$(find_supervisor_pids | tr '\n' ' ')"; [ -n "$supervisor_pids" ] && { echo "Stopping Awtsmoos supervisor PID(s): $supervisor_pids"; touch "$STOP_FILE"; for pid in $supervisor_pids; do kill "$pid" 2>/dev/null || true; done; wait_for_pids_to_exit supervisor $supervisor_pids; }; [ -n "$agent_pids" ] && { echo "Stopping Awtsmoos agent PID(s): $agent_pids"; for pid in $agent_pids; do kill "$pid" 2>/dev/null || true; done; wait_for_pids_to_exit agent $agent_pids; }; rm -f "$STOP_FILE" "$PID_FILE" "$SUP_PID_FILE"; }
start_supervisor() { write_supervisor; rm -f "$STOP_FILE"; supervisor_pid="$(find_supervisor_pid)"; if is_alive "$supervisor_pid"; then echo "$supervisor_pid" > "$SUP_PID_FILE"; echo "Awtsmoos supervisor already running: $supervisor_pid"; else nohup "$SUPERVISOR" > "$ROOT/supervisor-stdout.log" 2>&1 & supervisor_pid=$!; echo "$supervisor_pid" > "$SUP_PID_FILE"; echo "Awtsmoos supervisor started: $supervisor_pid"; fi; }

MANIFEST="$(curl -fsSL "$MANIFEST_URL")"; LINES="$(trim_manifest_lines "$MANIFEST")"; VERSION="$(printf '%s\n' "$LINES" | sed -n '1p')"; ENTRY="$(printf '%s\n' "$LINES" | sed -n '2p')"; FILES="$(printf '%s\n' "$LINES" | sed '1,2d' || true)"; HASH="$(manifest_hash "$LINES")"
[ -n "$VERSION" ] && [ -n "$ENTRY" ] || { echo "Manifest is missing version or entry."; exit 1; }; [ "$ENTRY" = "main.js" ] || { echo "Bad manifest entry: $ENTRY"; exit 1; }; [ -n "$FILES" ] || { echo "Manifest has no files."; exit 1; }; assert_safe_manifest_path "$ENTRY"
INSTALLED=""; INSTALLED_HASH=""; UPDATED=0; [ -f "$STATE" ] && INSTALLED="$(tr -d '[:space:]' < "$STATE")"; [ -f "$MANIFEST_STATE" ] && INSTALLED_HASH="$(tr -d '[:space:]' < "$MANIFEST_STATE")"
if [ "$INSTALLED" = "$VERSION" ] && [ "$INSTALLED_HASH" = "$HASH" ] && all_manifest_files_exist; then echo "Awtsmoos version $VERSION manifest $HASH already installed and complete."; else UPDATED=1; [ "$INSTALLED" = "$VERSION" ] && echo "Repairing Awtsmoos version $VERSION because manifest changed/incomplete..." || echo "Installing Awtsmoos version $VERSION..."; install_awtsmoos_bundles; all_manifest_files_exist || { echo "Bundle install verification failed."; exit 1; }; printf '%s\n' "$VERSION" > "$STATE"; printf '%s\n' "$HASH" > "$MANIFEST_STATE"; printf '%s\n' "$LINES" > "$MANIFEST_COPY"; fi
cleanup_disposable_state "$project_root"; cleanup_disposable_state "$(pwd)"
[ "${AWTSMOOS_SKIP_START:-}" = "1" ] || [ "${AWTSMOOS_SKIP_START:-}" = "true" ] && { echo "AWTSMOOS_SKIP_START set; install verified without starting agent."; exit 0; }
if [ "$UPDATED" = "1" ] || [ "${AWTSMOOS_RESTART:-}" = "1" ] || [ "${AWTSMOOS_RESTART:-}" = "true" ]; then stop_existing_runtime; fi
start_supervisor; sleep 0.2; agent_pid="$(find_agent_pid)"; supervisor_pid="$(find_supervisor_pid)"; echo "Awtsmoos agent PID: ${agent_pid:-starting}"; echo "Awtsmoos supervisor PID: ${supervisor_pid:-missing}"; echo "Local tunnel API: http://127.0.0.1:${AWTSMOOS_LOCAL_API_PORT:-3977}"; echo "Awtsmoos installer complete. The agent is supervised in the background."
