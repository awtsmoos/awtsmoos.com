#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos proves staged life before moving predecessor bytes.
prove_candidate_before_promotion() {
	start_candidate_probe
	if wait_for_candidate_probe; then
		write_activation_journal "candidate_probe_stable" "$CANDIDATE_ROOT" "$ROOT"
		install_event "candidate-probe" "passed" \
			"Staged runtime registered and answered a local command." \
			"pid=$CANDIDATE_PROBE_PID activation=$AWTSMOOS_ACTIVATION_ID"
		return 0
	fi
	install_event "candidate-probe" "failed" \
		"Staged runtime never reached stable registered command readiness." \
		"pid=$CANDIDATE_PROBE_PID log=$CANDIDATE_ROOT/candidate-probe.log"
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
	stop_candidate_probe
	stop_existing_runtime || true
	if [ -e "$ROOT" ]; then
		mv "$ROOT" "$rollback" || return 1
		migrate_runtime_device_state "$rollback"
	fi
	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		[ -e "$rollback" ] && mv "$rollback" "$ROOT" || true
		restart_preserved_predecessor || true
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
		write_activation_journal "candidate_stable" "$ROOT" "$rollback"
		[ -n "$rollback" ] && [ -e "$rollback" ] &&
			schedule_displaced_cleanup "$rollback"
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
