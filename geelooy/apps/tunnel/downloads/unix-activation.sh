#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Activation keeps the predecessor until the candidate proves registration. After
# commit, Awtsmoos.com schedules exact cleanup and returns success immediately.
activate_fresh() {
	mkdir -p "$(dirname "$ROOT")"
	write_activation_journal "fresh_prepared" "" "$CANDIDATE_ROOT"
	mv "$CANDIDATE_ROOT" "$ROOT"
	CANDIDATE_ROOT=""
	write_activation_journal "fresh_activated" "" "$ROOT"
	install_event "activate" "passed" \
		"Fresh candidate moved into the live path." "$ROOT"
	if skip_start_requested; then
		return 0
	fi
	install_progress 82 "Starting registered tunnel runtime"
	start_supervisor
	if wait_for_runtime 45; then
		write_activation_journal "committed" "" "$ROOT"
		install_event "startup" "passed" \
			"Fresh runtime registered successfully." "$ROOT"
		return 0
	fi
	remove_active_install
	write_activation_journal "fresh_failed" "" "$ROOT"
	install_fail "startup" \
		"Fresh runtime failed registration and was removed." \
		"state=$(connection_state_name)"
}

activate_update() {
	local rollback="${ROOT}.activation-rollback-$(date -u +%Y%m%dT%H%M%SZ)-$$"
	install_progress 69 "Creating compact predecessor archive"
	archive_known_good_runtime "$ROOT"
	install_progress 74 "Switching to the verified release"
	write_activation_journal "archive_verified" "$rollback" "$CANDIDATE_ROOT"
	stop_existing_runtime
	mv "$ROOT" "$rollback"
	write_activation_journal "predecessor_displaced" "$rollback" "$CANDIDATE_ROOT"
	mv "$CANDIDATE_ROOT" "$ROOT"
	CANDIDATE_ROOT=""
	write_activation_journal "candidate_activated" "$rollback" "$ROOT"
	install_event "activate" "passed" \
		"Candidate moved into the live path." \
		"root=$ROOT rollback=$rollback"
	if skip_start_requested; then
		schedule_displaced_cleanup "$rollback"
		write_activation_journal "committed" "$rollback" "$ROOT"
		return 0
	fi
	install_progress 82 "Starting registered tunnel runtime"
	start_supervisor
	if wait_for_runtime 45; then
		write_activation_journal "candidate_stable" "$rollback" "$ROOT"
		schedule_displaced_cleanup "$rollback"
		write_activation_journal "committed" "$rollback" "$ROOT"
		install_event "startup" "passed" \
			"Candidate registered; predecessor cleanup was detached." \
			"root=$ROOT rollback=$rollback state=$(connection_state_name)"
		return 0
	fi
	install_event "startup" "warning" \
		"Candidate missed registration deadline; restoring predecessor." \
		"state=$(connection_state_name)"
	stop_existing_runtime
	remove_active_install
	mv "$rollback" "$ROOT"
	write_activation_journal "predecessor_restored" "$rollback" "$ROOT"
	start_supervisor
	if wait_for_runtime 45; then
		write_activation_journal "rollback_stable" "$rollback" "$ROOT"
		install_fail "rollback" \
			"Candidate failed; predecessor was restored and registered." \
			"state=$(connection_state_name) root=$ROOT"
	fi
	install_event "rollback" "warning" \
		"Immediate predecessor also failed registration; escalating through recovery tiers." \
		"state=$(connection_state_name) root=$ROOT"
	if recover_registered_runtime "post_activation_failure"; then
		write_activation_journal "recovery_committed" "$rollback" "$ROOT"
		install_fail "rollback" \
			"Candidate failed; an archived runtime was restored and registered." \
			"state=$(connection_state_name) root=$ROOT"
	fi
	write_activation_journal "recovery_failed" "$rollback" "$ROOT"
	install_fail "rollback" \
		"Candidate, predecessor, archives, and legacy fallback all failed registration." \
		"state=$(connection_state_name) root=$ROOT"
}

activate_release_candidate() {
	if [ -d "$ROOT" ]; then
		activate_update
	else
		activate_fresh
	fi
}
