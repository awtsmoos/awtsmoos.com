#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets an exact living child heal network breath before replacement.
# Awtsmoos.com keeps process/identity supervision strict while upstream DNS and socket
# darkness receive bounded time inside the native reconnect covenant.

supervisor_network_grace_seconds() {
	local value="${AWTSMOOS_NETWORK_RECONNECT_GRACE_SECONDS:-1800}"
	case "$value" in *[!0-9]*|'') value=1800 ;; esac
	[ "$value" -ge 300 ] || value=300
	[ "$value" -le 7200 ] || value=7200
	printf '%s\n' "$value"
}

supervisor_network_recovering() {
	local pid="$1"
	local helper="$ROOT/awtsmoos-supervisor-network-state.cjs"
	[ -f "$helper" ] || return 1
	local state="$(node "$helper" "$ROOT/connection-state.json" "$pid" \
		"$(supervisor_expected_tunnel)" "${AWTSMOOS_ACTIVATION_ID:-}" \
		"$(supervisor_expected_version)" 2>/dev/null || true)"
	[ "$state" = "network_recovering" ]
}

network_grace_available() {
	local pid="$1"
	local elapsed="$2"
	[ "$elapsed" -lt "$(supervisor_network_grace_seconds)" ] || return 1
	supervisor_network_recovering "$pid"
}

wait_child_registration() {
	local timeout_seconds="${AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS:-45}"
	if device_pairing_pending && [ -z "${AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS:-}" ]; then
		timeout_seconds=600
	fi
	local stability_seconds="$(registration_stability_seconds "$timeout_seconds")"
	local elapsed=0
	local last_network_log=0
	reset_registration_stability
	while supervisor_alive "$CHILD_PID"; do
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
		if [ "$elapsed" -ge "$timeout_seconds" ]; then
			if ! network_grace_available "$CHILD_PID" "$elapsed"; then
				supervisor_log "registration_timeout" \
					"pid=$CHILD_PID $(supervisor_receipt_summary "$CHILD_PID")"
				return 1
			fi
			if [ $(( elapsed - last_network_log )) -ge 60 ]; then
				last_network_log="$elapsed"
				supervisor_log "initial_registration_network_grace" \
					"pid=$CHILD_PID elapsedSeconds=$elapsed"
			fi
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	return 1
}

monitor_registered_child() {
	local grace_seconds="${AWTSMOOS_RECONNECT_GRACE_SECONDS:-300}"
	local disconnected_at=0
	local last_network_log=0
	while supervisor_alive "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		if supervisor_receipt_matches "$CHILD_PID"; then
			disconnected_at=0
			last_network_log=0
			mark_supervisor_healthy 0 || true
		else
			local now="$(date +%s)"
			[ "$disconnected_at" -gt 0 ] || disconnected_at="$now"
			local outage=$(( now - disconnected_at ))
			if [ "$outage" -ge "$grace_seconds" ]; then
				if network_grace_available "$CHILD_PID" "$outage"; then
					if [ $(( now - last_network_log )) -ge 60 ]; then
						last_network_log="$now"
						supervisor_log "registration_network_grace" \
							"pid=$CHILD_PID outageSeconds=$outage"
					fi
				else
					supervisor_log "registration_lost" \
						"pid=$CHILD_PID graceSeconds=$grace_seconds $(supervisor_receipt_summary "$CHILD_PID")"
					return 2
				fi
			fi
		fi
		sleep 2
	done
	return 1
}
