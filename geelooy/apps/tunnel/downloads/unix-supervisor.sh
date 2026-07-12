#!/usr/bin/env bash
# B"H Awtsmoos forever supervisor
set -u

ROOT="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
ENTRY="${AWTSMOOS_ENTRY:-main.js}"
PID_FILE="$ROOT/agent.pid"
SUP_PID_FILE="$ROOT/supervisor.pid"
LOG_FILE="$ROOT/agent-supervisor.log"
STOP_FILE="$ROOT/stop-supervisor"
MIN_SLEEP="${AWTSMOOS_SUPERVISOR_MIN_SLEEP:-1}"
MAX_SLEEP="${AWTSMOOS_SUPERVISOR_MAX_SLEEP:-30}"
mkdir -p "$ROOT"
echo $$ > "$SUP_PID_FILE"
rm -f "$STOP_FILE"

log() {
	printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >> "$LOG_FILE"
}

is_alive() {
	[ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}

find_agent_pid() {
	LC_ALL=C ps axww -o pid= -o command= | awk -v self="$$" -v needle="$ROOT/$ENTRY" '$1!=self&&index($0,"node " needle)>0{print $1;exit}'
}

sleep_for="$MIN_SLEEP"
while [ ! -f "$STOP_FILE" ]; do
	pid=""
	[ -f "$PID_FILE" ] && pid="$(cat "$PID_FILE" 2>/dev/null || true)"
	if is_alive "$pid"; then sleep 2; continue; fi
	extant="$(find_agent_pid)"
	if is_alive "$extant"; then echo "$extant" > "$PID_FILE"; sleep 2; continue; fi
	nohup node "$ROOT/$ENTRY" >> "$ROOT/agent.log" 2>&1 &
	pid=$!
	echo "$pid" > "$PID_FILE"
	log "agent pid $pid started"
	sleep "$sleep_for"
	if is_alive "$pid"; then
		sleep_for="$MIN_SLEEP"
	else
		sleep_for=$((sleep_for * 2))
		[ "$sleep_for" -gt "$MAX_SLEEP" ] && sleep_for="$MAX_SLEEP"
	fi
done
log 'stop file present; supervisor exiting'
