#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos proves staged life before moving predecessor bytes. Identity mutation
# authority is explicit: fresh creation may pair; update proof is physically read-only.
prove_candidate_before_promotion() {
	local identity_authority="${1:-readonly}"
	start_candidate_probe "$identity_authority"
	if wait_for_candidate_probe; then
		write_activation_journal "candidate_probe_stable" "$CANDIDATE_ROOT" "$ROOT"
		install_event "candidate-probe" "passed" \
			"Staged runtime registered and answered a local command." \
			"pid=$CANDIDATE_PROBE_PID activation=$AWTSMOOS_ACTIVATION_ID identity=$identity_authority"
		return 0
	fi
	install_event "candidate-probe" "failed" \
		"Staged runtime never reached stable registered command readiness." \
		"pid=$CANDIDATE_PROBE_PID log=$CANDIDATE_ROOT/candidate-probe.log identity=$identity_authority"
	write_activation_journal "candidate_probe_failed" "$CANDIDATE_ROOT" "$ROOT"
	stop_candidate_probe
	restart_preserved_predecessor || true
	return 1
}

restart_preserved_predecessor() {
	[ -f "$ROOT/main.js" ] || return 0
	local existing="$(find_existing_agent 2>/dev/null || true)"
	if runtime_pid_matches "$existing" && runtime_registered "$existing" 600000; then
		return 0
	fi
	install_event "predecessor" "restarting" \
		"Candidate probe ended; untouched predecessor is being restored." "$ROOT"
	if [ -x "$ROOT/awtsmoos-supervisor.sh" ]; then
		start_restored_supervisor || return 1
	else
		start_supervisor || return 1
	fi
	restored_runtime_ready "${AWTSMOOS_PREDECESSOR_RESTART_TIMEOUT_SECONDS:-60}"
}

promote_candidate_root() {
	local rollback="$1"
	# Snapshot while the predecessor still owns the live path. If this fails,
	# no runtime is moved and no new agent can mutate durable identity state.
	identity_rollback_snapshot || install_fail "identity-rollback" \
		"Could not protect the existing device identity; installation stopped." \
		"The previous tunnel has not been displaced."
	stop_candidate_probe
	stop_existing_runtime || true
	if [ -e "$ROOT" ]; then
		mv "$ROOT" "$rollback" || return 1
		migrate_runtime_device_state "$rollback"
	fi
	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		[ -e "$rollback" ] && mv "$rollback" "$ROOT" || true
		restart_preserved_predecessor || true
		identity_rollback_discard || true
		return 1
	fi
	CANDIDATE_ROOT=""
	write_activation_journal "candidate_promoted" "$ROOT" "$rollback"
	return 0
}

start_promoted_candidate() {
	local rollback="$1"
	local failed="$2"
	start_supervisor
	if candidate_is_stably_active; then
		# B"H 2026-11-08 hardening: the readiness probe above accepts a
		# receipt up to 10 minutes old, which a stale predecessor receipt
		# could satisfy. Require a FRESH live registration from the newly
		# promoted agent itself — a real TUNNEL_ACK within the last 120s —
		# before declaring success. If it is not fresh, roll back loudly
		# instead of leaving a live-but-silent agent.
		local fresh_age_ms=""
		if declare -F require_fresh_registration >/dev/null 2>&1; then
			fresh_age_ms="$(require_fresh_registration "${AWTSMOOS_PROMOTED_REGISTRATION_FRESH_SECONDS:-120}" 2>/dev/null || true)"
			if [ -z "$fresh_age_ms" ]; then
				install_event "startup" "failed" \
					"Promoted agent has no fresh live registration receipt." \
					"expected a TUNNEL_ACK within ${AWTSMOOS_PROMOTED_REGISTRATION_FRESH_SECONDS:-120}s state=$(connection_state_name)"
				if [ -n "$rollback" ] && [ -e "$rollback" ]; then
					rollback_failed_activation "$rollback" "$failed"
					return $?
				fi
				stop_existing_runtime || true
				[ -e "$ROOT" ] && mv "$ROOT" "$failed"
				recover_without_predecessor
				return $?
			fi
			install_event "startup" "passed" \
				"Promoted agent holds a fresh live registration receipt." \
				"receiptAgeMs=$fresh_age_ms"
		fi
		write_activation_journal "candidate_stable" "$ROOT" "$rollback"
		if [ -n "$rollback" ] && [ -e "$rollback" ]; then
			if [ "${AWTSMOOS_KEEP_OLD_TUNNELS:-0}" = "1" ]; then
				install_event "cleanup" "preserved" "Previous runtime retained as an explicit backup." "path=$rollback"
			else
				schedule_displaced_cleanup "$rollback"
			fi
		fi
		# The new agent is verified. Only now retire all known older generations.
		schedule_previous_install_cleanup || true
		identity_rollback_discard || true
		write_activation_journal "committed" "$ROOT" "$rollback"
		install_event "startup" "passed" \
			"Promoted candidate sustained registration and guardianship." \
			"root=$ROOT state=$(connection_state_name)"
		return 0
	fi
	install_event "startup" "warning" \
		"Promoted candidate failed readiness; exact predecessor returns." \
		"expectedVersion=$CANDIDATE_VERSION state=$(connection_state_name)"
	if [ -n "$rollback" ] && [ -e "$rollback" ]; then
		rollback_failed_activation "$rollback" "$failed"
		return $?
	fi
	stop_existing_runtime || true
	[ -e "$ROOT" ] && mv "$ROOT" "$failed"
	recover_without_predecessor
}
