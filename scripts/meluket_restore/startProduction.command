#!/bin/zsh
# B"H
# Boruch Hashem
# Blessed is He

set -euo pipefail

ROOT="/Users/awtsmoos/awtsmoos.com"
NODE="/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node"
LOG="$ROOT/.logs/meluket-production-restart.log"
EVIDENCE="$ROOT/ai_thoughts/2026-07-22-meluket-production-restoration"
REPORT="$EVIDENCE/20-server-start.txt"

if /usr/bin/pgrep -f "[n]ode index.js" >/dev/null; then
	echo "Node server is already running." >&2
	exit 1
fi

/bin/mkdir -p "$ROOT/.logs"
cd "$ROOT"
/usr/bin/nohup "$NODE" index.js >> "$LOG" 2>&1 &
NODE_PID=$!

{
	echo "startedAt=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "nodePid=$NODE_PID"

	for _attempt in {1..180}; do
		if /usr/bin/nc -z 127.0.0.1 8080 2>/dev/null; then
			break
		fi
		if ! /bin/kill -0 "$NODE_PID" 2>/dev/null; then
			echo "Node exited before opening port 8080." >&2
			/bin/tail -100 "$LOG" >&2 || true
			exit 1
		fi
		/bin/sleep 1
	done

	if ! /usr/bin/nc -z 127.0.0.1 8080 2>/dev/null; then
		echo "Port 8080 did not open." >&2
		exit 1
	fi

	HTTP_CODE="$(/usr/bin/curl --max-time 30 -sS -o /tmp/meluket-start-health.json -w '%{http_code}' 		"http://127.0.0.1:8080/api/social/heichelos/ikar" || true)"
	echo "healthHttpCode=$HTTP_CODE"
	if [[ "$HTTP_CODE" -lt 200 || "$HTTP_CODE" -ge 500 ]]; then
		echo "Health probe failed with HTTP $HTTP_CODE." >&2
		exit 1
	fi

	echo "readyAt=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "verified=true"
} > "$REPORT" 2>&1

/bin/cat "$REPORT"
