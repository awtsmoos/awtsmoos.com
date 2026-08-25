#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos preserves one sealed flame outside the live runtime; Awtsmoos.com
# resolves Node from durable state and never mistakes the emergency parent for the primary.
LIVE="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SLOT="$RECOVERY/emergency-runtime/current"
PID_FILE="$RECOVERY/emergency-runtime/emergency.pid"
LOG_FILE="$RECOVERY/emergency-runtime/emergency.log"
TAKEOVER="${AWTSMOOS_EMERGENCY_TAKEOVER:-0}"

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

stop_verified() {
	local file="$1"
	local needle="$2"
	local pid="$(cat "$file" 2>/dev/null || true)"
	if [ -z "$pid" ]; then
		return 0
	fi
	if ! kill -0 "$pid" 2>/dev/null; then
		return 0
	fi
	if ! ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$needle"; then
		printf '%s\n' "ERROR ambiguous_process pid=$pid" >&2
		exit 45
	fi
	if [ "$TAKEOVER" != "1" ]; then
		printf '%s\n' "ERROR normal_runtime_alive set_AWTSMOOS_EMERGENCY_TAKEOVER=1" >&2
		exit 46
	fi
	kill -TERM "$pid" 2>/dev/null || true
}

wait_registered() {
	local pid="$1"
	local name=""
	local elapsed=0
	name="$("$NODE_BIN" -p "require('$SLOT/config.json').tunnelName || ''" 2>/dev/null || true)"
	while [ "$elapsed" -lt 90 ]; do
		if "$NODE_BIN" "$SLOT/scripts/connection-status.cjs" check \
			"$SLOT" "$pid" "$name" 30000 "" "" >/dev/null 2>&1; then
			return 0
		fi
		if ! kill -0 "$pid" 2>/dev/null; then
			return 1
		fi
		sleep 0.5
		elapsed=$(( elapsed + 1 ))
	done
	return 1
}

NODE_BIN="$(resolve_node 2>/dev/null || true)"
if [ -z "$NODE_BIN" ]; then
	printf '%s\n' "ERROR sealed_emergency_node_missing" >&2
	exit 43
fi
if [ ! -f "$SLOT/scripts/emergency-control.cjs" ]; then
	printf '%s\n' "ERROR sealed_emergency_control_missing" >&2
	exit 44
fi
existing="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -n "$existing" ] && kill -0 "$existing" 2>/dev/null; then
	if wait_registered "$existing"; then
		printf '%s\n' "OK sealed_emergency_registered pid=$existing"
		exit 0
	fi
fi

"$NODE_BIN" "$SLOT/scripts/emergency-control.cjs" verify "$SLOT" "$RECOVERY" >/dev/null || exit 47
"$NODE_BIN" "$SLOT/scripts/emergency-control.cjs" prepare "$SLOT" "$RECOVERY" >/dev/null || exit 48
stop_verified "$LIVE/agent.pid" "$LIVE/awtsmoos-agent-launcher.cjs"
stop_verified "$LIVE/supervisor.pid" "$LIVE/awtsmoos-supervisor.sh"
sleep 1
mkdir -p "$(dirname "$LOG_FILE")"
PROJECT_ROOT="$("$NODE_BIN" -e 'try{process.stdout.write(require(process.argv[1]).root||process.cwd())}catch{process.stdout.write(process.cwd())}' "$SLOT/config.json")"
export AWTSMOOS_INSTALL_ROOT="$SLOT"
export AWTSMOOS_RECOVERY_ROOT="$RECOVERY"
export AWTSMOOS_PROJECT_ROOT="$PROJECT_ROOT"
export AWTSMOOS_COMMAND_TIER=0
export AWTSMOOS_COMMAND_MAX_ACTIVE=1
export AWTSMOOS_EMERGENCY_MODE=1
export AWTSMOOS_MISSION_BOOT_RESUME=0
export AWTSMOOS_SELF_UPDATE_DISABLED=1
nohup "$NODE_BIN" "$SLOT/awtsmoos-agent-launcher.cjs" "$SLOT" >> "$LOG_FILE" 2>&1 </dev/null &
printf '%s\n' "$!" > "$PID_FILE"
if ! wait_registered "$!"; then
	printf '%s\n' "ERROR sealed_emergency_registration_failed log=$LOG_FILE" >&2
	exit 49
fi
printf '%s\n' "OK sealed_emergency_registered pid=$! root=$SLOT log=$LOG_FILE"
