#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

ROOT="${1:-$HOME/.awtsmoos-tunnel}"
RECOVERY_ROOT="${AWTSMOOS_RECOVERY_ROOT:-${ROOT}-recovery}"
LOG="$ROOT/agent-supervisor.log"
RECOVERY_LOG="$ROOT/recovery.log"
PID_FILE="$ROOT/agent.pid"
SUPERVISOR_PID_FILE="$ROOT/supervisor.pid"
STOP_FILE="$ROOT/stop-supervisor"
BACKOFF_SECONDS=1
MAX_BACKOFF_SECONDS=30

mkdir -p "$ROOT" "$RECOVERY_ROOT"
printf '%s\n' "$$" > "$SUPERVISOR_PID_FILE"

cleanup() {
	rm -f "$SUPERVISOR_PID_FILE"
}

stop_child() {
	if [ -n "${CHILD_PID:-}" ] && kill -0 "$CHILD_PID" 2>/dev/null; then
		kill "$CHILD_PID" 2>/dev/null || true
		wait "$CHILD_PID" 2>/dev/null || true
	fi
	rm -f "$PID_FILE"
}

trap 'stop_child; cleanup; exit 0' INT TERM
trap cleanup EXIT

log() {
	printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$LOG"
}

recovery_environment() {
	node "$ROOT/scripts/recovery-control.cjs" before-start "$ROOT" --shell 2>> "$RECOVERY_LOG"
}

restore_if_required() {
	if [ "${AWTSMOOS_RECOVERY_RESTORE:-0}" != "1" ]; then
		return 0
	fi
	log "integrity failure requested tier-$AWTSMOOS_RECOVERY_TIER restore"
	node "$ROOT/scripts/recovery-restore.cjs" \
		"$ROOT" \
		"$AWTSMOOS_RECOVERY_TIER" \
		"$RECOVERY_ROOT" >> "$RECOVERY_LOG" 2>&1
}

while true; do
	if [ -f "$STOP_FILE" ]; then
		log "stop file observed"
		rm -f "$STOP_FILE"
		break
	fi

	RECOVERY_ENV="$(recovery_environment)" || true
	eval "$RECOVERY_ENV"
	if ! restore_if_required; then
		log "restore failed; descending one tier"
		node "$ROOT/scripts/recovery-control.cjs" \
			report-failure "$ROOT" restore_failed restore >> "$RECOVERY_LOG" 2>&1 || true
		sleep "$BACKOFF_SECONDS"
		continue
	fi

	RECOVERY_ENV="$(recovery_environment)" || true
	eval "$RECOVERY_ENV"
	export AWTSMOOS_COMMAND_TIER
	if [ -n "${AWTSMOOS_COMMAND_MAX_ACTIVE:-}" ]; then
		export AWTSMOOS_COMMAND_MAX_ACTIVE
	else
		unset AWTSMOOS_COMMAND_MAX_ACTIVE 2>/dev/null || true
	fi

	START_SECONDS="$(date +%s)"
	log "starting tier=$AWTSMOOS_RECOVERY_TIER"
	node "$ROOT/main.js" >> "$ROOT/agent.log" 2>&1 &
	CHILD_PID=$!
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"

	while kill -0 "$CHILD_PID" 2>/dev/null; do
		if [ -f "$STOP_FILE" ]; then
			stop_child
			break 2
		fi
		sleep 2
	done

	wait "$CHILD_PID" 2>/dev/null
	EXIT_CODE=$?
	END_SECONDS="$(date +%s)"
	RUNTIME_MS=$(( (END_SECONDS - START_SECONDS) * 1000 ))
	rm -f "$PID_FILE"
	node "$ROOT/scripts/recovery-control.cjs" \
		after-exit "$ROOT" "$RUNTIME_MS" "$EXIT_CODE" >> "$RECOVERY_LOG" 2>&1 || true
	log "agent exited code=$EXIT_CODE runtimeMs=$RUNTIME_MS"

	if [ "$RUNTIME_MS" -ge 30000 ]; then
		BACKOFF_SECONDS=1
	else
		BACKOFF_SECONDS=$(( BACKOFF_SECONDS * 2 ))
		if [ "$BACKOFF_SECONDS" -gt "$MAX_BACKOFF_SECONDS" ]; then
			BACKOFF_SECONDS="$MAX_BACKOFF_SECONDS"
		fi
	fi
	sleep "$BACKOFF_SECONDS"
done
