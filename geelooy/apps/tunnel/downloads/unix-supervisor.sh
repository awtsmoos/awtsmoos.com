#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

ROOT="${1:-$HOME/.awtsmoos-tunnel}"
RECOVERY_ROOT="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
LOG="$ROOT/agent-supervisor.log"
RECOVERY_LOG="$RECOVERY_ROOT/logs/supervisor-recovery.log"
PID_FILE="$ROOT/agent.pid"
SUPERVISOR_PID_FILE="$ROOT/supervisor.pid"
STOP_FILE="$ROOT/stop-supervisor"
BACKOFF_SECONDS=1
MAX_BACKOFF_SECONDS=30
CHILD_PID=""
CHILD_OWNED=0
CHILD_KIND="modern"
export AWTSMOOS_INSTALL_ROOT="$ROOT" AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT"

mkdir -p "$ROOT" "$RECOVERY_ROOT/logs"
source "$ROOT/awtsmoos-node-runtime.sh"
if ! activate_node_runtime "$ROOT"; then
	printf '%s event=node_runtime_missing root=%s\n' \
		"$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$ROOT" >> "$LOG"
	exit 78
fi
source "$ROOT/awtsmoos-legacy-catalog.sh"
source "$ROOT/awtsmoos-supervisor-runtime.sh"
source "$ROOT/awtsmoos-supervisor-agents.sh"
source "$ROOT/awtsmoos-supervisor-guard.sh"
source "$ROOT/awtsmoos-supervisor-health-memory.sh"
source "$ROOT/awtsmoos-supervisor-receipt.sh"
source "$ROOT/awtsmoos-supervisor-health.sh"
source "$ROOT/awtsmoos-supervisor-recovery.sh"
source "$ROOT/awtsmoos-supervisor-identity.sh"
source "$ROOT/awtsmoos-supervisor-emergency.sh"
source "$ROOT/awtsmoos-supervisor-legacy.sh"
acquire_supervisor_guard
trap finish_supervisor INT TERM
trap cleanup_supervisor EXIT

while true; do
	[ -f "$STOP_FILE" ] && finish_supervisor
	START_SECONDS="$(date +%s)"
	CHILD_PID="$(find_existing_agent)"
	if supervisor_alive "$CHILD_PID"; then
		CHILD_OWNED=0
		CHILD_KIND="modern"
		printf '%s\n' "$CHILD_PID" > "$PID_FILE"
		supervisor_log "agent_adopted" "pid=$CHILD_PID"
	else
		RECOVERY_ENV="$(recovery_environment)" || true
		eval "$RECOVERY_ENV"
		if [ "${AWTSMOOS_RECOVERY_RESTORE:-0}" = "1" ]; then
			if ! perform_external_restore; then
				if start_supervisor_emergency; then
					monitor_supervisor_emergency || true
					stop_supervisor_emergency
					sleep 1
					continue
				fi
				if start_legacy_bridge; then
					monitor_legacy_bridge || true
					stop_managed_child
					sleep 1
					continue
				fi
				supervisor_log "all_recovery_failed" "sleep=10"
				sleep 10
				continue
			fi
		fi
		start_new_agent
	fi
	if ! wait_child_registration; then
		REGISTRATION_REASON="$(supervisor_receipt_failure_reason "$CHILD_PID")"
		report_registration_failure "$REGISTRATION_REASON"
		stop_managed_child
		repair_identity_after_registration_failure "$REGISTRATION_REASON" || true
		record_child_exit "$START_SECONDS" 70
		BACKOFF_SECONDS=$(( BACKOFF_SECONDS * 2 ))
		[ "$BACKOFF_SECONDS" -le "$MAX_BACKOFF_SECONDS" ] ||
			BACKOFF_SECONDS="$MAX_BACKOFF_SECONDS"
		sleep "$BACKOFF_SECONDS"
		continue
	fi
	confirm_pending_restore
	reset_archive_offset
	BACKOFF_SECONDS=1
	monitor_registered_child
	MONITOR_RESULT=$?
	if [ "$MONITOR_RESULT" -eq 2 ]; then
		report_registration_failure "registration_lost"
		stop_managed_child
		repair_identity_after_registration_failure "registration_lost" || true
		record_child_exit "$START_SECONDS" 71
		continue
	fi
	EXIT_CODE=1
	if [ "$CHILD_OWNED" = "1" ]; then
		wait "$CHILD_PID" 2>/dev/null
		EXIT_CODE=$?
	fi
	record_child_exit "$START_SECONDS" "$EXIT_CODE"
	if [ $(( $(date +%s) - START_SECONDS )) -ge 30 ]; then
		BACKOFF_SECONDS=1
	else
		BACKOFF_SECONDS=$(( BACKOFF_SECONDS * 2 ))
		[ "$BACKOFF_SECONDS" -le "$MAX_BACKOFF_SECONDS" ] ||
			BACKOFF_SECONDS="$MAX_BACKOFF_SECONDS"
	fi
	sleep "$BACKOFF_SECONDS"
done
