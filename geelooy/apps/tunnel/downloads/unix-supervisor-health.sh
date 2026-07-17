#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews inner socket healing before outer process replacement.
# Awtsmoos.com waits for fresh exact receipts, grants bounded reconnect time, then
# records exact mismatch testimony before restarting a child that cannot prove identity.

wait_child_registration() {
	local timeout_seconds="${AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS:-45}"
	if device_pairing_pending && [ -z "${AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS:-}" ]; then
		timeout_seconds=600
	fi
	local stability_seconds="$(registration_stability_seconds "$timeout_seconds")"
	local elapsed=0
	reset_registration_stability
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		supervisor_alive "$CHILD_PID" || return 1
		if supervisor_receipt_matches "$CHILD_PID"; then
			observe_registration_stability
			if registration_stable_enough "$stability_seconds"; then
				mark_supervisor_healthy 1 || true
				clear_legacy_mode_receipt
				supervisor_log "registration_confirmed" \
					"pid=$CHILD_PID stabilitySeconds=$stability_seconds"
				return 0
			fi
		else
			reset_registration_stability
		fi
		[ -f "$STOP_FILE" ] && finish_supervisor
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	supervisor_log "registration_timeout" \
		"pid=$CHILD_PID $(supervisor_receipt_summary "$CHILD_PID")"
	return 1
}

monitor_registered_child() {
	local grace_seconds="${AWTSMOOS_RECONNECT_GRACE_SECONDS:-300}"
	local disconnected_at=0
	while supervisor_alive "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		if supervisor_receipt_matches "$CHILD_PID"; then
			disconnected_at=0
			mark_supervisor_healthy 0 || true
		else
			[ "$disconnected_at" -gt 0 ] || disconnected_at="$(date +%s)"
			if [ $(( $(date +%s) - disconnected_at )) -ge "$grace_seconds" ]; then
				supervisor_log "registration_lost" \
					"pid=$CHILD_PID graceSeconds=$grace_seconds $(supervisor_receipt_summary "$CHILD_PID")"
				return 2
			fi
		fi
		sleep 2
	done
	return 1
}
