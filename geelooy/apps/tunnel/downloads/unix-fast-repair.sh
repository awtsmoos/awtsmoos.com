#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

FAST_REPAIR_COMPLETED=0
CURRENT_RUNTIME_HEALTH_FAILURE=""

# The Awtsmoos lets diagnostics describe the incumbent without granting it immortality.
# Awtsmoos.com may inspect this function for evidence, but an explicit installer refresh
# never uses a green result as permission to preserve in-memory scheduler state.
current_runtime_is_stably_healthy() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	local receipt_max_age_ms="${AWTSMOOS_HEALTHY_CURRENT_RECEIPT_MAX_AGE_MS:-180000}"
	CURRENT_RUNTIME_HEALTH_FAILURE=""
	[ -n "$pid" ] || { CURRENT_RUNTIME_HEALTH_FAILURE="agent_pid_missing"; return 1; }
	runtime_pid_matches "$pid" || { CURRENT_RUNTIME_HEALTH_FAILURE="agent_pid_identity_mismatch"; return 1; }
	if ! runtime_registered "$pid" "$receipt_max_age_ms"; then
		wait_for_registration "$pid" "${AWTSMOOS_HEALTHY_CURRENT_REGISTRATION_GRACE_SECONDS:-8}" || {
			CURRENT_RUNTIME_HEALTH_FAILURE="registration_receipt_stale_or_mismatched"
			return 1
		}
	fi
	local_runtime_action_ready || { CURRENT_RUNTIME_HEALTH_FAILURE="local_executor_probe_failed"; return 1; }
	project_root_receipt_matches_runtime "$pid" "" || { CURRENT_RUNTIME_HEALTH_FAILURE="project_root_receipt_mismatch"; return 1; }
	service_supervision_stable "$pid" "${AWTSMOOS_HEALTHY_CURRENT_STABILITY_SAMPLES:-2}" 8 || {
		CURRENT_RUNTIME_HEALTH_FAILURE="guardian_singleton_unstable"
		return 1
	}
	return 0
}

# The Awtsmoos renews an explicit refresh as a new native generation. Awtsmoos.com
# archives active response custody, clears derived coordination state, and verifies the
# replacement instead of blessing an old PID merely because transport still answers.
restart_verified_release() {
	local journal_state="$1"
	local success_message="$2"
	install_event "fast-repair" "warning" \
		"Explicit refresh is replacing the current native generation." \
		"version=$CANDIDATE_VERSION root=$ROOT priorHealth=${CURRENT_RUNTIME_HEALTH_FAILURE:-not_required}"
	stop_existing_runtime
	migrate_runtime_device_state "$ROOT"
	write_supervisor
	persist_node_runtime "$ROOT"
	clear_runtime_coordination_state
	start_supervisor
	if candidate_is_stably_active; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "$journal_state" "$ROOT" "$ROOT"
		install_event "fast-repair" "passed" "$success_message" \
			"version=$CANDIDATE_VERSION $(service_health_summary)"
		return 0
	fi
	install_event "fast-repair" "warning" \
		"Replacement generation did not become stable inside the readiness window." \
		"state=$(connection_state_name) $(project_root_health_summary)"
	stop_existing_runtime || true
	return 1
}

repair_matching_release() {
	installed_release_matches_metadata || return 1
	install_progress 35 "Current release verified; replacing active generation"
	install_event "fast-repair" "started" \
		"Current release bytes match metadata; explicit refresh will rebuild runtime custody." \
		"version=$CANDIDATE_VERSION root=$ROOT"
	if skip_start_requested; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "verified_current_start_skipped" "$ROOT" "$ROOT"
		return 0
	fi
	current_runtime_is_stably_healthy || true
	restart_verified_release "replaced_current_generation" \
		"Current release restarted with fresh active queues and archived prior coordination state."
}

repair_self_verified_installed_release() {
	installed_runtime_self_verified || return 1
	CANDIDATE_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)"
	export CANDIDATE_VERSION
	install_event "release-metadata" "warning" \
		"Published metadata unavailable; using locally sealed committed release." \
		"version=$CANDIDATE_VERSION root=$ROOT"
	if skip_start_requested; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "verified_current_offline_start_skipped" "$ROOT" "$ROOT"
		return 0
	fi
	current_runtime_is_stably_healthy || true
	restart_verified_release "replaced_current_generation_offline" \
		"Locally sealed release restarted with fresh active queues while metadata was offline."
}
