#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

supervisor_log() {
	local event="$1"
	local detail="${2:-}"

	printf '%s event=%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$event" "$detail" >> "$LOG"
}

supervisor_alive() {
	[ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}

supervisor_command_contains() {
	local pid="$1"
	local expected="$2"

	supervisor_alive "$pid" && ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$expected"
}

find_existing_agent() {
	local candidate
	candidate="$(cat "$PID_FILE" 2>/dev/null || true)"

	if supervisor_command_contains "$candidate" "$ROOT/main.js"; then
		printf '%s\n' "$candidate"
		return 0
	fi

	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null | \
		awk -v needle="$ROOT/main.js" 'index($0, "node " needle) > 0 { print $1; exit }'
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
		wait "$CHILD_PID" 2>/dev/null || true
	fi
}

finish_supervisor() {
	stop_owned_child
	cleanup_supervisor
	exit 0
}

recovery_environment() {
	node "$ROOT/scripts/recovery-control.cjs" before-start "$ROOT" --shell 2>> "$RECOVERY_LOG"
}

perform_external_restore() {
	local rescue="$RECOVERY_ROOT/bin/awtsmoos-recovery-rescue.sh"

	if [ ! -x "$rescue" ]; then
		supervisor_log "restore_unavailable" "missing=$rescue"
		return 1
	fi

	supervisor_log "restore_started" "tier=${AWTSMOOS_RECOVERY_TIER:-0} reason=${AWTSMOOS_RECOVERY_REASON:-unknown}"

	if ! "$rescue" "$ROOT" "$RECOVERY_ROOT" "${AWTSMOOS_RECOVERY_TIER:-0}" >> "$RECOVERY_LOG" 2>&1; then
		supervisor_log "restore_failed" "NO_HEALTHY_RECOVERY_CANDIDATE"
		return 1
	fi

	local version
	local candidate
	version="$(node -e "try{const r=require('$RECOVERY_ROOT/last-restore.json');process.stdout.write(r.version||'')}catch{}")"
	candidate="$(node -e "try{const r=require('$RECOVERY_ROOT/last-restore.json');process.stdout.write(r.candidate||'')}catch{}")"
	node "$ROOT/scripts/recovery-control.cjs" mark-restored "$ROOT" "$version" "$candidate" \
		>> "$RECOVERY_LOG" 2>&1 || true
	supervisor_log "restore_passed" "version=$version candidate=$candidate"
}

start_new_agent() {
	export AWTSMOOS_SELF_UPDATE_MODE="notify"
	export AWTSMOOS_COMMAND_TIER

	if [ -n "${AWTSMOOS_COMMAND_MAX_ACTIVE:-}" ]; then
		export AWTSMOOS_COMMAND_MAX_ACTIVE
	else
		unset AWTSMOOS_COMMAND_MAX_ACTIVE 2>/dev/null || true
	fi

	node "$ROOT/main.js" >> "$ROOT/agent.log" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	supervisor_log "agent_started" "pid=$CHILD_PID tier=${AWTSMOOS_RECOVERY_TIER:-5}"
}

monitor_agent() {
	while supervisor_alive "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		sleep 2
	done
}
