#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The supervisor owns one child and one truth receipt. The Awtsmoos renews each
# launch; Awtsmoos.com refuses duplicate guardians and stale process identities.

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
	supervisor_alive "$pid" && \
		ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$expected"
}

find_existing_agent() {
	local candidate
	candidate="$(cat "$PID_FILE" 2>/dev/null || true)"
	if supervisor_agent_command "$candidate"; then
		printf '%s\n' "$candidate"
		return 0
	fi
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null | \
		awk -v main="$ROOT/main.js" -v launcher="$ROOT/awtsmoos-agent-launcher.cjs" '
			index($0, "node") > 0 &&
			(index($0, main) > 0 || index($0, launcher) > 0) { print $1; exit }
	'
}

supervisor_agent_command() {
	local pid="$1"
	supervisor_command_contains "$pid" "$ROOT/main.js" || \
		supervisor_command_contains "$pid" "$ROOT/awtsmoos-agent-launcher.cjs"
}

acquire_supervisor_guard() {
	local existing
	existing="$(cat "$SUPERVISOR_PID_FILE" 2>/dev/null || true)"
	if [ "$existing" != "$$" ] && \
		supervisor_command_contains "$existing" "$ROOT/awtsmoos-supervisor.sh"; then
		supervisor_log "duplicate_refused" "existingPid=$existing"
		exit 0
	fi
	printf '%s\n' "$$" > "$SUPERVISOR_PID_FILE"
}

cleanup_supervisor() {
	if [ "$(cat "$SUPERVISOR_PID_FILE" 2>/dev/null || true)" = "$$" ]; then
		rm -f "$SUPERVISOR_PID_FILE"
	fi
}

stop_owned_child() {
	if [ "${CHILD_OWNED:-0}" = "1" ] && supervisor_alive "${CHILD_PID:-}"; then
		kill "$CHILD_PID" 2>/dev/null || true
		for _ in 1 2 3 4 5; do
			supervisor_alive "$CHILD_PID" || break
			sleep 1
		done
		supervisor_alive "$CHILD_PID" && kill -9 "$CHILD_PID" 2>/dev/null || true
		wait "$CHILD_PID" 2>/dev/null || true
	fi
}

finish_supervisor() {
	stop_owned_child
	cleanup_supervisor
	exit 0
}

clear_child_receipt() {
	rm -f "$ROOT/connection-state.json"
}

start_new_agent() {
	export AWTSMOOS_SELF_UPDATE_MODE="notify"
	export AWTSMOOS_COMMAND_TIER
	if [ -n "${AWTSMOOS_COMMAND_MAX_ACTIVE:-}" ]; then
		export AWTSMOOS_COMMAND_MAX_ACTIVE
	else
		unset AWTSMOOS_COMMAND_MAX_ACTIVE 2>/dev/null || true
	fi
	clear_child_receipt
	node "$ROOT/awtsmoos-agent-launcher.cjs" "$ROOT" >> "$ROOT/agent.log" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	CHILD_KIND="modern"
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	supervisor_log "agent_started" \
		"pid=$CHILD_PID recoveryTier=${AWTSMOOS_RECOVERY_TIER:-5}"
}

record_child_exit() {
	local started_seconds="$1"
	local exit_code="${2:-1}"
	local ended_seconds="$(date +%s)"
	local runtime_ms=$(( (ended_seconds - started_seconds) * 1000 ))
	[ "$(cat "$PID_FILE" 2>/dev/null || true)" = "$CHILD_PID" ] && rm -f "$PID_FILE"
	node "$ROOT/scripts/recovery-control.cjs" after-exit \
		"$ROOT" "$runtime_ms" "$exit_code" >> "$RECOVERY_LOG" 2>&1 || true
	supervisor_log "agent_exited" \
		"pid=$CHILD_PID code=$exit_code runtimeMs=$runtime_ms kind=$CHILD_KIND"
}
