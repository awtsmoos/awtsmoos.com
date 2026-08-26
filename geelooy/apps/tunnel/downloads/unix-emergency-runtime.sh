#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos preserves one sealed, authenticated, one-worker repair vessel outside
# every replaceable live runtime path; Awtsmoos.com uses the exact persisted Node light.
emergency_root() {
	printf '%s\n' "$RECOVERY_ROOT/emergency-runtime/current"
}

emergency_pid_file() {
	printf '%s\n' "$RECOVERY_ROOT/emergency-runtime/emergency.pid"
}

emergency_log_file() {
	printf '%s\n' "$RECOVERY_ROOT/emergency-runtime/emergency.log"
}

emergency_node_bin() {
	if [ -x "${AWTSMOOS_NODE_BIN:-}" ]; then
		printf '%s\n' "$AWTSMOOS_NODE_BIN"
		return 0
	fi
	return 1
}

capture_emergency_runtime() {
	local node_bin="$(emergency_node_bin 2>/dev/null || true)"
	if [ -z "$node_bin" ] || [ ! -f "$ROOT/scripts/emergency-control.cjs" ]; then
		return 1
	fi
	AWTSMOOS_RUNTIME_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" \
	AWTSMOOS_MANIFEST_SHA="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null || true)" \
		"$node_bin" "$ROOT/scripts/emergency-control.cjs" capture "$ROOT" "$RECOVERY_ROOT" \
		>> "$RECOVERY_ROOT/logs/emergency-capture.log" 2>&1
}

emergency_process_matches() {
	local pid="$1"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null && \
		ps -p "$pid" -o command= 2>/dev/null | \
		grep -Fq "$(emergency_root)/awtsmoos-agent-launcher.cjs"
}

stop_emergency_runtime() {
	local pid="$(cat "$(emergency_pid_file)" 2>/dev/null || true)"
	if emergency_process_matches "$pid"; then
		kill -TERM "$pid" 2>/dev/null || true
		for _ in 1 2 3 4 5 6 7 8 9 10; do
			if ! emergency_process_matches "$pid"; then
				break
			fi
			sleep 0.2
		done
		if emergency_process_matches "$pid"; then
			kill -KILL "$pid" 2>/dev/null || true
		fi
	fi
	rm -f "$(emergency_pid_file)"
}

start_emergency_runtime() {
	local node_bin="$(emergency_node_bin 2>/dev/null || true)"
	local slot="$(emergency_root)"
	local prepared="$RECOVERY_ROOT/emergency-runtime/prepared.json"
	local version="$(cat "$slot/install-state.txt" 2>/dev/null || true)"
	if [ -z "$node_bin" ]; then
		return 1
	fi
	"$node_bin" "$slot/scripts/emergency-control.cjs" prepare "$slot" "$RECOVERY_ROOT" \
		> "$prepared" 2>> "$(emergency_log_file)" || return 1
	stop_emergency_runtime
	export AWTSMOOS_INSTALL_ROOT="$slot"
	export AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT"
	export AWTSMOOS_COMMAND_TIER=0
	export AWTSMOOS_COMMAND_MAX_ACTIVE=1
	export AWTSMOOS_EMERGENCY_MODE=1
	export AWTSMOOS_MISSION_BOOT_RESUME=0
	export AWTSMOOS_SELF_UPDATE_DISABLED=1
	export AWTSMOOS_LOCAL_API_PORT="${AWTSMOOS_EMERGENCY_LOCAL_API_PORT:-3987}"
	export AWTSMOOS_RUNTIME_VERSION="$version"
	export AWTSMOOS_ACTIVATION_ID="emergency-$(date -u +%Y%m%dT%H%M%SZ)-$$"
	"$node_bin" "$slot/awtsmoos-agent-launcher.cjs" "$slot" \
		>> "$(emergency_log_file)" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	CHILD_KIND="emergency"
	printf '%s\n' "$CHILD_PID" > "$(emergency_pid_file)"
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	supervisor_log "emergency_started" "pid=$CHILD_PID version=$version root=$slot"
	wait_for_emergency_registration "$slot" "$version" "$node_bin"
}

wait_for_emergency_registration() {
	local slot="$1"
	local version="$2"
	local node_bin="$3"
	local name="$("$node_bin" -p "require('$slot/config.json').tunnelName || ''")"
	local elapsed=0
	while [ "$elapsed" -lt "${AWTSMOOS_EMERGENCY_TIMEOUT_SECONDS:-45}" ]; do
		if ! emergency_process_matches "$CHILD_PID"; then
			return 1
		fi
		if "$node_bin" "$slot/scripts/connection-status.cjs" check "$slot" \
			"$CHILD_PID" "$name" 30000 "$AWTSMOOS_ACTIVATION_ID" "$version" \
			>/dev/null 2>&1; then
			supervisor_log "emergency_registered" "pid=$CHILD_PID version=$version"
			return 0
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	return 1
}
