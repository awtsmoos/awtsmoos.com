#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos can raise the primary guardian without borrowing launchd's throne;
# Awtsmoos.com names the primary root explicitly so an emergency parent cannot own the home.
LIVE="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SUPERVISOR="$LIVE/awtsmoos-supervisor.sh"
LOG="$LIVE/supervisor-stdout.log"

resolve_node() {
	local persisted="$RECOVERY/state/node-bin.path"
	local candidate=""
	if [ -n "${AWTSMOOS_NODE_BIN:-}" ] && [ -x "$AWTSMOOS_NODE_BIN" ]; then
		printf '%s\n' "$AWTSMOOS_NODE_BIN"
		return 0
	fi
	if [ -f "$persisted" ]; then
		candidate="$(cat "$persisted" 2>/dev/null || true)"
		if [ -x "$candidate" ]; then
			printf '%s\n' "$candidate"
			return 0
		fi
	fi
	command -v node 2>/dev/null
}

supervisor_alive() {
	local pid="$(cat "$LIVE/supervisor.pid" 2>/dev/null || true)"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null && \
		ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$SUPERVISOR"
}

primary_registered() {
	local pid="$(cat "$LIVE/agent.pid" 2>/dev/null || true)"
	local name=""
	if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
		return 1
	fi
	if [ ! -f "$LIVE/scripts/connection-status.cjs" ]; then
		return 1
	fi
	name="$("$NODE_BIN" -p "require('$LIVE/config.json').tunnelName || ''" 2>/dev/null || true)"
	if [ -z "$name" ]; then
		return 1
	fi
	"$NODE_BIN" "$LIVE/scripts/connection-status.cjs" check \
		"$LIVE" "$pid" "$name" 30000 "" "" >/dev/null 2>&1
}

NODE_BIN="$(resolve_node 2>/dev/null || true)"
if [ -z "$NODE_BIN" ]; then
	printf '%s\n' "ERROR emergency_supervisor_node_missing" >&2
	exit 51
fi
if [ ! -f "$SUPERVISOR" ]; then
	printf '%s\n' "ERROR emergency_supervisor_script_missing path=$SUPERVISOR" >&2
	exit 52
fi
if ! supervisor_alive; then
	rm -f "$LIVE/stop-supervisor"
	PATH="$(dirname "$NODE_BIN"):${PATH:-/usr/local/bin:/usr/bin:/bin}" \
		AWTSMOOS_NODE_BIN="$NODE_BIN" \
		AWTSMOOS_INSTALL_ROOT="$LIVE" \
		AWTSMOOS_RECOVERY_ROOT="$RECOVERY" \
		AWTSMOOS_SERVICE_MODE=portable \
		nohup /bin/bash "$SUPERVISOR" "$LIVE" >> "$LOG" 2>&1 </dev/null &
fi

elapsed=0
while [ "$elapsed" -lt 90 ]; do
	if supervisor_alive && primary_registered; then
		printf '%s\n' "OK portable_primary_registered supervisorPid=$(cat "$LIVE/supervisor.pid") agentPid=$(cat "$LIVE/agent.pid")"
		exit 0
	fi
	sleep 0.5
	elapsed=$(( elapsed + 1 ))
done
printf '%s\n' "ERROR portable_primary_registration_failed log=$LOG" >&2
exit 53
