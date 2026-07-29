#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

FAST_REPAIR_COMPLETED=0

current_runtime_is_stably_healthy() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	local receipt_max_age_ms="${AWTSMOOS_HEALTHY_CURRENT_RECEIPT_MAX_AGE_MS:-45000}"
	[ -n "$pid" ] &&
		runtime_pid_matches "$pid" &&
		runtime_registered "$pid" "$receipt_max_age_ms" &&
		local_runtime_action_ready &&
		project_root_receipt_matches_runtime "$pid" &&
		service_supervision_stable "$pid" \
			"${AWTSMOOS_HEALTHY_CURRENT_STABILITY_SAMPLES:-8}" 10
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
