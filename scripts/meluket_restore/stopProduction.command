#!/bin/zsh
# B"H
# Boruch Hashem
# Blessed is He

set -euo pipefail

ROOT="/Users/awtsmoos/awtsmoos.com"
EVIDENCE="$ROOT/ai_thoughts/2026-07-22-meluket-production-restoration"
REPORT="$EVIDENCE/18-server-stop.txt"

{
	echo "startedAt=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	NODE_PIDS=("${(@f)$(/usr/bin/pgrep -f "[n]ode index.js" || true)}")
	NODE_PIDS=("${NODE_PIDS[@]:#}")
	echo "nodePids=${(j:,:)NODE_PIDS}"

	for NODE_PID in "${NODE_PIDS[@]}"; do
		/bin/kill -TERM "$NODE_PID"
	done

	for _attempt in {1..90}; do
		remaining=0
		for NODE_PID in "${NODE_PIDS[@]}"; do
			if /bin/kill -0 "$NODE_PID" 2>/dev/null; then
				remaining=1
			fi
		done
		if [[ "$remaining" -eq 0 ]]; then
			break
		fi
		/bin/sleep 1
	done

	for NODE_PID in "${NODE_PIDS[@]}"; do
		if /bin/kill -0 "$NODE_PID" 2>/dev/null; then
			echo "Node did not stop gracefully: $NODE_PID" >&2
			exit 1
		fi
	done

	for _attempt in {1..60}; do
		if ! /usr/bin/nc -z 127.0.0.1 8080 2>/dev/null; then
			break
		fi
		/bin/sleep 1
	done

	if /usr/bin/nc -z 127.0.0.1 8080 2>/dev/null; then
		echo "Port 8080 is still open." >&2
		exit 1
	fi

	echo "stoppedAt=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "verified=true"
} > "$REPORT" 2>&1

/bin/cat "$REPORT"
