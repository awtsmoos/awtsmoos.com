#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos preserves one sealed, authenticated, one-worker repair vessel outside
# every replaceable live runtime path. It never bypasses identity or server approval.
emergency_root() {
	printf '%s\n' "$RECOVERY_ROOT/emergency-runtime/current"
}

emergency_pid_file() {
	printf '%s\n' "$RECOVERY_ROOT/emergency-runtime/emergency.pid"
}

emergency_log_file() {
	printf '%s\n' "$RECOVERY_ROOT/emergency-runtime/emergency.log"
}

capture_emergency_runtime() {
	[ -x "$ROOT/scripts/emergency-control.cjs" ] || return 1
	AWTSMOOS_RUNTIME_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" \
	AWTSMOOS_MANIFEST_SHA="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null || true)" \
		node "$ROOT/scripts/emergency-control.cjs" capture "$ROOT" "$RECOVERY_ROOT" \
		>> "$RECOVERY_ROOT/logs/emergency-capture.log" 2>&1
}

emergency_process_matches() {
	local pid="$1"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null &&
		ps -p "$pid" -o command= 2>/dev/null |
		grep -Fq "$(emergency_root)/awtsmoos-agent-launcher.cjs"
}

stop_emergency_runtime() {
	local pid="$(cat "$(emergency_pid_file)" 2>/dev/null || true)"
	if emergency_process_matches "$pid"; then
		kill -TERM "$pid" 2>/dev/null || true
		for _ in 1 2 3 4 5 6 7 8 9 10; do
			emergency_process_matches "$pid" || break
			sleep 0.2
		done
		emergency_process_matches "$pid" && kill -KILL "$pid" 2>/dev/null || true
	fi
	rm -f "$(emergency_pid_file)"
}

start_emergency_runtime() {
	local slot="$(emergency_root)"
	local prepared="$RECOVERY_ROOT/emergency-runtime/prepared.json"
	local version="$(cat "$slot/install-state.txt" 2>/dev/null || true)"
	node "$slot/scripts/emergency-control.cjs" prepare "$slot" "$RECOVERY_ROOT" \
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
	node "$slot/awtsmoos-agent-launcher.cjs" "$slot" \
		>> "$(emergency_log_file)" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	CHILD_KIND="emergency"
	printf '%s\n' "$CHILD_PID" > "$(emergency_pid_file)"
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	supervisor_log "emergency_started" \
		"pid=$CHILD_PID version=$version root=$slot"
	wait_for_emergency_registration "$slot" "$version"
}

wait_for_emergency_registration() {
	local slot="$1"
	local version="$2"
	local name="$(node -p "require('$slot/config.json').tunnelName || ''")"
	local elapsed=0
	while [ "$elapsed" -lt "${AWTSMOOS_EMERGENCY_TIMEOUT_SECONDS:-45}" ]; do
		emergency_process_matches "$CHILD_PID" || return 1
		if node "$slot/scripts/connection-status.cjs" check "$slot" \
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

monitor_emergency_runtime() {
	local retry="${AWTSMOOS_EMERGENCY_RETRY_SECONDS:-300}"
	local started="$(date +%s)"
	while emergency_process_matches "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		[ $(( $(date +%s) - started )) -ge "$retry" ] && return 2
		sleep 2
	done
	return 1
}
