#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

ROOT="${1:-$HOME/.awtsmoos-tunnel}"
RECOVERY_ROOT="${AWTSMOOS_RECOVERY_ROOT:-${ROOT}-recovery}"
LOG="$ROOT/agent-supervisor.log"
RECOVERY_LOG="$RECOVERY_ROOT/logs/supervisor-recovery.log"
PID_FILE="$ROOT/agent.pid"
SUPERVISOR_PID_FILE="$ROOT/supervisor.pid"
STOP_FILE="$ROOT/stop-supervisor"
BACKOFF_SECONDS=1
MAX_BACKOFF_SECONDS=30
CHILD_PID=""
CHILD_OWNED=0

mkdir -p "$ROOT" "$RECOVERY_ROOT/logs"
source "$ROOT/awtsmoos-supervisor-runtime.sh"
acquire_supervisor_guard
trap finish_supervisor INT TERM
trap cleanup_supervisor EXIT

while true; do
	[ -f "$STOP_FILE" ] && finish_supervisor

	CHILD_PID="$(find_existing_agent)"
	if supervisor_alive "$CHILD_PID"; then
		CHILD_OWNED=0
		printf '%s\n' "$CHILD_PID" > "$PID_FILE"
		supervisor_log "agent_adopted" "pid=$CHILD_PID"
	else
		RECOVERY_ENV="$(recovery_environment)" || true
		eval "$RECOVERY_ENV"

		if [ "${AWTSMOOS_RECOVERY_RESTORE:-0}" = "1" ]; then
			if ! perform_external_restore; then
				sleep 30
				continue
			fi

			RECOVERY_ENV="$(recovery_environment)" || true
			eval "$RECOVERY_ENV"
		fi

		START_SECONDS="$(date +%s)"
		start_new_agent
	fi

	monitor_agent
	EXIT_CODE=1

	if [ "$CHILD_OWNED" = "1" ]; then
		wait "$CHILD_PID" 2>/dev/null
		EXIT_CODE=$?
	fi

	END_SECONDS="$(date +%s)"
	RUNTIME_MS=$(( (END_SECONDS - ${START_SECONDS:-$END_SECONDS}) * 1000 ))
	[ "$(cat "$PID_FILE" 2>/dev/null || true)" = "$CHILD_PID" ] && rm -f "$PID_FILE"
	node "$ROOT/scripts/recovery-control.cjs" after-exit "$ROOT" "$RUNTIME_MS" "$EXIT_CODE" \
		>> "$RECOVERY_LOG" 2>&1 || true
	supervisor_log "agent_exited" "pid=$CHILD_PID code=$EXIT_CODE runtimeMs=$RUNTIME_MS"

	if [ "$RUNTIME_MS" -ge 30000 ]; then
		BACKOFF_SECONDS=1
	else
		BACKOFF_SECONDS=$(( BACKOFF_SECONDS * 2 ))
		[ "$BACKOFF_SECONDS" -gt "$MAX_BACKOFF_SECONDS" ] && \
			BACKOFF_SECONDS="$MAX_BACKOFF_SECONDS"
	fi

	sleep "$BACKOFF_SECONDS"
done
