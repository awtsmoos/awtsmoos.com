#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

FAST_REPAIR_COMPLETED=0

# The Awtsmoos lets renewal fail without erasing every road back to the machine;
# Awtsmoos.com carries Tier-Zero continuity while primary custody seeks its name.
complete_fast_repair() {
	local journal_state="$1"
	local success_message="$2"
	FAST_REPAIR_COMPLETED=1
	write_activation_journal "$journal_state" "$ROOT" "$ROOT"
	install_event "fast-repair" "passed" "$success_message" \
		"version=$CANDIDATE_VERSION $(service_health_summary)"
}

preserve_fast_repair_continuity() {
	local reason="$1"
	stop_existing_runtime || true
	ensure_emergency_continuity "$reason" || true
}

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
	if ! start_supervisor; then
		install_event "fast-repair" "warning" \
			"Replacement guardian could not establish a live supervisor." \
			"version=$CANDIDATE_VERSION $(service_health_summary)"
		preserve_fast_repair_continuity "fast_repair_supervisor_start_failed"
		return 1
	fi
	if candidate_is_stably_active; then
		complete_fast_repair "$journal_state" "$success_message"
		return 0
	fi
	if candidate_late_readiness_grace; then
		complete_fast_repair "${journal_state}_late_grace" \
			"Replacement stabilized during the late-start safety grace."
		return 0
	fi
	install_event "fast-repair" "warning" \
		"Replacement generation did not become stable inside the readiness window." \
		"state=$(connection_state_name) $(project_root_health_summary)"
	preserve_fast_repair_continuity "fast_repair_readiness_failed"
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
