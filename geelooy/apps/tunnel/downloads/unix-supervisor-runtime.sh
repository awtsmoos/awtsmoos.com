#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews one supervisor log, one canonical child, and one exit record.
# Awtsmoos.com rechecks the exact-root census immediately before spawn, adopting a
# racing healthy child instead of creating another body beside it.
supervisor_log() {
	local event="$1"
	local detail="${2:-}"
	printf '%s event=%s %s\n' \
		"$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$event" "$detail" >> "$LOG"
}

supervisor_alive() {
	[ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}

supervisor_command_contains() {
	local pid="$1"
	local expected="$2"
	supervisor_alive "$pid" &&
		ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$expected"
}

supervisor_agent_command() {
	local pid="$1"
	supervisor_command_contains "$pid" "$ROOT/main.js" ||
		supervisor_command_contains "$pid" "$ROOT/awtsmoos-agent-launcher.cjs"
}

finish_supervisor() {
	stop_managed_child
	stop_emergency_runtime 2>/dev/null || true
	cleanup_supervisor
	exit 0
}

clear_child_receipt() {
	rm -f "$ROOT/connection-state.json" "$ROOT/project-root-state.json"
}

start_new_agent() {
	local existing=""
	export AWTSMOOS_SELF_UPDATE_MODE="notify"
	export AWTSMOOS_COMMAND_TIER
	if [ -n "${AWTSMOOS_COMMAND_MAX_ACTIVE:-}" ]; then
		export AWTSMOOS_COMMAND_MAX_ACTIVE
	else
		unset AWTSMOOS_COMMAND_MAX_ACTIVE 2>/dev/null || true
	fi
	stop_emergency_runtime 2>/dev/null || true
	stop_supervisor_legacy_processes
	existing="$(reconcile_agent_processes)"
	if supervisor_agent_command "$existing"; then
		CHILD_PID="$existing"
		CHILD_OWNED=0
		CHILD_KIND="modern"
		printf '%s\n' "$CHILD_PID" > "$PID_FILE"
		supervisor_log "agent_adopted_before_spawn" "pid=$CHILD_PID"
		return 0
	fi
	clear_child_receipt
	node "$ROOT/awtsmoos-agent-launcher.cjs" "$ROOT" >> "$ROOT/agent.log" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	CHILD_KIND="modern"
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	supervisor_log "agent_started" \
		"pid=$CHILD_PID recoveryTier=${AWTSMOOS_RECOVERY_TIER:-5} node=$AWTSMOOS_NODE_BIN"
}

record_child_exit() {
	local started_seconds="$1"
	local exit_code="${2:-1}"
	local ended_seconds="$(date +%s)"
	local runtime_ms=$(( (ended_seconds - started_seconds) * 1000 ))
	if [ "$(cat "$PID_FILE" 2>/dev/null || true)" = "$CHILD_PID" ]; then
		rm -f "$PID_FILE"
	fi
	node "$ROOT/scripts/recovery-control.cjs" after-exit \
		"$ROOT" "$runtime_ms" "$exit_code" >> "$RECOVERY_LOG" 2>&1 || true
	supervisor_log "agent_exited" \
		"pid=$CHILD_PID code=$exit_code runtimeMs=$runtime_ms kind=$CHILD_KIND"
}
