#!/bin/bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

EVIDENCE=/Users/awtsmoos/tunnel-repair-evidence/live-queue-hardening-20260722T165200Z
LIVE=/Users/awtsmoos/.awtsmoos-tunnel
REPORT="$EVIDENCE/58-guardian-restart-proof.txt"
DONE="$EVIDENCE/58-guardian-restart-proof.done"
STATUS=0

read_json_field() {
	local file="$1"
	local key="$2"
	/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node - "$file" "$key" <<'NODE'
const fs = require("node:fs");
const [file, key] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value[key] ?? ""));
} catch {}
NODE
}

count_processes() {
	local pattern="$1"
	pgrep -f "$pattern" 2>/dev/null | wc -l | tr -d ' '
}

rm -f "$DONE"
{
	printf '%s\n' 'B"H'
	printf 'started_utc='; date -u +%Y-%m-%dT%H:%M:%SZ
	printf 'before_version='; sed -n '2p' "$LIVE/installed-manifest.txt"
	printf 'before_tunnel_id='; read_json_field "$LIVE/connection-state.json" tunnelId
	printf '\n'
	LABEL=$(launchctl list | awk '/com\.awtsmoos\.tunnel\./ {print $3; exit}')
	printf 'launchd_label=%s\n' "$LABEL"
	[ -n "$LABEL" ] || STATUS=10
	[ "$STATUS" -eq 0 ] || exit "$STATUS"
	launchctl kickstart -k "gui/$(id -u)/$LABEL"
	READY=0
	for ATTEMPT in $(seq 1 80); do
		VERSION=$(sed -n '2p' "$LIVE/installed-manifest.txt" 2>/dev/null || true)
		AGENT_COUNT=$(count_processes '^node /Users/awtsmoos/\.awtsmoos-tunnel/awtsmoos-agent-launcher\.cjs')
		SUPERVISOR_COUNT=$(count_processes '^/bin/bash /Users/awtsmoos/\.awtsmoos-tunnel/awtsmoos-supervisor\.sh')
		TUNNEL_ID=$(read_json_field "$LIVE/connection-state.json" tunnelId)
		if [ "$VERSION" = 1.0.378 ] && [ "$AGENT_COUNT" = 1 ] && [ "$SUPERVISOR_COUNT" = 1 ] && [ -n "$TUNNEL_ID" ]; then
			READY=1
			break
		fi
		sleep 0.5
	done
	[ "$READY" -eq 1 ] || STATUS=20
	printf 'ready=%s\n' "$READY"
	printf 'attempts=%s\n' "$ATTEMPT"
	printf 'after_version=%s\n' "$VERSION"
	printf 'after_tunnel_id=%s\n' "$TUNNEL_ID"
	printf 'launchd_labels='; launchctl list | awk '/com\.awtsmoos\.tunnel\./{n++} END{print n+0}'
	printf 'supervisors=%s\n' "$SUPERVISOR_COUNT"
	printf 'agents=%s\n' "$AGENT_COUNT"
	printf 'filesystem_workers='; count_processes '/Users/awtsmoos/\.awtsmoos-tunnel/tools/fs/executor/worker-child\.cjs'
	printf 'proof_status=%s\n' "$STATUS"
	printf 'finished_utc='; date -u +%Y-%m-%dT%H:%M:%SZ
} > "$REPORT" 2>&1
printf '%s\n' "$STATUS" > "$DONE"
exit "$STATUS"
