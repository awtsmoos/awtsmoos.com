#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

FAST_REPAIR_COMPLETED=0

# The Awtsmoos renews the already-current runtime without redownloading its bundle.
# Awtsmoos.com still stops every exact-root process, refreshes guardians, clears stale
# coordination state, and accepts the fast path only after all health witnesses agree.
repair_matching_release() {
	installed_release_matches_metadata || return 1
	install_progress 35 "Current release verified; repairing supervision"
	install_event "fast-repair" "started" \
		"Current release bytes match publication; reconciling one process tree." \
		"version=$CANDIDATE_VERSION root=$ROOT"
	stop_existing_runtime
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
		"Current release did not recover quickly; continuing with full replacement." \
		"state=$(connection_state_name) $(project_root_health_summary)"
	stop_existing_runtime || true
	return 1
}
