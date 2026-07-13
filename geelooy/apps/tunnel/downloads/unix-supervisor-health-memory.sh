#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Sustained registration becomes durable recovery memory at a bounded cadence.
# The Awtsmoos renews every healthy instant; Awtsmoos.com waits for stability,
# then records enough truth without turning every heartbeat into disk churn.

LAST_HEALTH_MARK_SECONDS=0
REGISTRATION_STABLE_SINCE_SECONDS=0

supervisor_runtime_version() {
	cat "$ROOT/install-state.txt" 2>/dev/null || printf '%s' unknown
}

reset_registration_stability() {
	REGISTRATION_STABLE_SINCE_SECONDS=0
}

observe_registration_stability() {
	local now="$(date +%s)"
	if [ "$REGISTRATION_STABLE_SINCE_SECONDS" -le 0 ]; then
		REGISTRATION_STABLE_SINCE_SECONDS="$now"
	fi
}

registration_stable_enough() {
	local required="${1:-${AWTSMOOS_SUPERVISOR_STABILITY_SECONDS:-5}}"
	local now="$(date +%s)"
	[ "$REGISTRATION_STABLE_SINCE_SECONDS" -gt 0 ] && \
		[ $(( now - REGISTRATION_STABLE_SINCE_SECONDS )) -ge "$required" ]
}

registration_stability_seconds() {
	local timeout_seconds="$1"
	local requested="${AWTSMOOS_SUPERVISOR_STABILITY_SECONDS:-5}"
	local maximum=$(( timeout_seconds > 2 ? timeout_seconds - 2 : 1 ))
	if [ "$requested" -gt "$maximum" ]; then
		printf '%s\n' "$maximum"
	else
		printf '%s\n' "$requested"
	fi
}

mark_supervisor_healthy() {
	local force="${1:-0}"
	local interval="${AWTSMOOS_HEALTH_MARK_SECONDS:-300}"
	local now="$(date +%s)"
	if [ "$force" != "1" ] && \
		[ $(( now - LAST_HEALTH_MARK_SECONDS )) -lt "$interval" ]; then
		return 0
	fi
	node "$ROOT/scripts/recovery-control.cjs" mark-healthy \
		"$ROOT" "$(supervisor_runtime_version)" "$CHILD_PID" \
		>> "$RECOVERY_LOG" 2>&1 || return 1
	LAST_HEALTH_MARK_SECONDS="$now"
	supervisor_log "runtime_health_recorded" \
		"pid=$CHILD_PID version=$(supervisor_runtime_version)"
}
