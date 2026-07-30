#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

FAST_REPAIR_COMPLETED=0
CURRENT_RUNTIME_HEALTH_FAILURE=""

current_runtime_is_stably_healthy() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	local receipt_max_age_ms="${AWTSMOOS_HEALTHY_CURRENT_RECEIPT_MAX_AGE_MS:-180000}"
	CURRENT_RUNTIME_HEALTH_FAILURE=""
	[ -n "$pid" ] || {
		CURRENT_RUNTIME_HEALTH_FAILURE="agent_pid_missing"
		return 1
	}
	runtime_pid_matches "$pid" || {
		CURRENT_RUNTIME_HEALTH_FAILURE="agent_pid_identity_mismatch"
		return 1
	}
	# Inbound transport activity is normally checkpointed every ten seconds. A
	# three-minute ceiling tolerates laptop scheduling and slow metadata fetches,
	# while the real local action below independently rejects a wedged executor.
	runtime_registered "$pid" "$receipt_max_age_ms" || {
		CURRENT_RUNTIME_HEALTH_FAILURE="registration_receipt_stale_or_mismatched"
		return 1
	}
	local_runtime_action_ready || {
		CURRENT_RUNTIME_HEALTH_FAILURE="local_executor_probe_failed"
		return 1
	}
		# The current process belongs to the preceding successful activation.
		# A reinstall creates a fresh transaction id before this check, so binding
		# the live receipt to that new id would force every healthy no-op to restart.
	project_root_receipt_matches_runtime "$pid" "" || {
		CURRENT_RUNTIME_HEALTH_FAILURE="project_root_receipt_mismatch"
		return 1
	}
	service_supervision_stable "$pid" \
		"${AWTSMOOS_HEALTHY_CURRENT_STABILITY_SAMPLES:-2}" 8 || {
		CURRENT_RUNTIME_HEALTH_FAILURE="guardian_singleton_unstable"
		return 1
	}
	return 0
}

# The Awtsmoos renews the already-current runtime without redownloading its bundle.
# When version policy preserves a newer local revelation, failure remains visible
# and cannot fall through into activation of the older published archive.
repair_matching_release() {
	installed_release_matches_metadata || return 1
	install_progress 35 "Current release verified; repairing supervision"
	install_event "fast-repair" "started" \
		"Current release bytes match selected metadata; reconciling one process tree." \
		"version=$CANDIDATE_VERSION root=$ROOT"
	if skip_start_requested; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "verified_current_start_skipped" "$ROOT" "$ROOT"
		install_event "fast-repair" "passed" \
			"Current release bytes verified; process restart skipped by request." \
			"version=$CANDIDATE_VERSION root=$ROOT"
		return 0
	fi
	if current_runtime_is_stably_healthy; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "verified_current_healthy" "$ROOT" "$ROOT"
		install_event "fast-repair" "passed" \
			"Current release, fresh relay receipt, executor, and guardian are healthy; restart avoided." \
			"version=$CANDIDATE_VERSION $(service_health_summary)"
		return 0
	fi
	install_event "fast-repair" "warning" \
		"Current release requires bounded runtime repair." \
		"reason=${CURRENT_RUNTIME_HEALTH_FAILURE:-unknown} $(runtime_health_summary "$(
			cat "$ROOT/agent.pid" 2>/dev/null || true
		)") $(service_health_summary)"
	stop_existing_runtime
	migrate_runtime_device_state "$ROOT"
	write_supervisor
	persist_node_runtime "$ROOT"
	clear_runtime_coordination_state
	start_supervisor
	if candidate_is_stably_active; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "repaired_current" "$ROOT" "$ROOT"
		install_event "fast-repair" "passed" \
			"Current release restarted under one healthy durable guardian." \
			"version=$CANDIDATE_VERSION $(service_health_summary)"
		return 0
	fi
	install_event "fast-repair" "warning" \
		"Current release did not recover inside the bounded readiness window." \
		"preserveNewer=$PRESERVE_NEWER_RELEASE state=$(connection_state_name) $(project_root_health_summary)"
	stop_existing_runtime || true
	return 1
}

# If Awtsmoos.com is momentarily unreachable, preserve or repair a release that
# can prove its own committed manifest and complete runtime seal. This does not
# claim that no newer release exists; it truthfully guarantees that reinstalling
# never destroys an already healthy tunnel merely because metadata transport
# suffered a transient reset.
repair_self_verified_installed_release() {
	installed_runtime_self_verified || return 1
	CANDIDATE_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)"
	export CANDIDATE_VERSION
	install_event "release-metadata" "warning" \
		"Published metadata is temporarily unavailable; using the locally sealed committed release." \
		"version=$CANDIDATE_VERSION root=$ROOT"
	if skip_start_requested; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "verified_current_offline_start_skipped" "$ROOT" "$ROOT"
		return 0
	fi
	if current_runtime_is_stably_healthy; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "verified_current_healthy_offline" "$ROOT" "$ROOT"
		install_event "fast-repair" "passed" \
			"Locally sealed current release and guardian are healthy; network failure caused no restart." \
			"version=$CANDIDATE_VERSION $(service_health_summary)"
		return 0
	fi
	install_event "fast-repair" "warning" \
		"Locally sealed release requires bounded runtime repair." \
		"reason=${CURRENT_RUNTIME_HEALTH_FAILURE:-unknown} $(runtime_health_summary "$(
			cat "$ROOT/agent.pid" 2>/dev/null || true
		)") $(service_health_summary)"
	stop_existing_runtime
	migrate_runtime_device_state "$ROOT"
	write_supervisor
	persist_node_runtime "$ROOT"
	clear_runtime_coordination_state
	start_supervisor
	if candidate_is_stably_active; then
		FAST_REPAIR_COMPLETED=1
		write_activation_journal "repaired_current_offline" "$ROOT" "$ROOT"
		install_event "fast-repair" "passed" \
			"Locally sealed current release recovered while published metadata was unavailable." \
			"version=$CANDIDATE_VERSION $(service_health_summary)"
		return 0
	fi
	install_event "fast-repair" "warning" \
		"Locally sealed release could not recover inside the bounded readiness window." \
		"state=$(connection_state_name) $(project_root_health_summary)"
	return 1
}
