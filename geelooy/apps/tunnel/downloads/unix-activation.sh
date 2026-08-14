#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Activation keeps the untouched predecessor until the candidate proves readiness.
# A verified candidate always replaces a degraded incumbent; failure to archive an
# incompatible predecessor remains nonfatal and never converts repair into staging.
activate_fresh() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local displaced=""
	mkdir -p "$(dirname "$ROOT")"
	if [ -e "$ROOT" ]; then
		displaced="${ROOT}.incomplete-${stamp}-$$"
		mv "$ROOT" "$displaced"
		migrate_runtime_device_state "$displaced"
	fi
	write_activation_journal "fresh_prepared" "$CANDIDATE_ROOT" "$displaced"
	mv "$CANDIDATE_ROOT" "$ROOT"
	CANDIDATE_ROOT=""
	write_activation_journal "fresh_activated" "$ROOT" "$displaced"
	install_event "activate" "passed" \
		"Fresh candidate moved into the live path." "$ROOT"
	if skip_start_requested; then
		[ -n "$displaced" ] && schedule_displaced_cleanup "$displaced"
		write_activation_journal "committed" "$ROOT" "$displaced"
		return 0
	fi
	install_progress 82 "Starting registered tunnel runtime"
	start_supervisor
	if candidate_is_stably_active; then
		[ -n "$displaced" ] && schedule_displaced_cleanup "$displaced"
		write_activation_journal "committed" "$ROOT" "$displaced"
		install_event "startup" "passed" \
			"Fresh runtime registered successfully." "$ROOT"
		return 0
	fi
	remove_active_install
	[ -n "$displaced" ] && [ -e "$displaced" ] && mv "$displaced" "$ROOT"
	write_activation_journal "fresh_failed" "$ROOT" "$displaced"
	install_fail "startup" \
		"Fresh runtime failed registration and was removed." \
		"state=$(connection_state_name)"
}

activate_update() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local rollback="${ROOT}.activation-rollback-${stamp}-$$"
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}-$$"
	install_progress 69 "Creating compact predecessor archive"
	if ! archive_known_good_runtime "known_good_before_activation"; then
		install_event "archive" "warning" \
			"Predecessor was not compatible enough to archive; activation will continue." \
			"root=$ROOT candidate=$CANDIDATE_VERSION"
	fi
	install_progress 74 "Switching to the verified release"
	write_activation_journal "archive_checked" "$rollback" "$CANDIDATE_ROOT"
	stop_existing_runtime
	mv "$ROOT" "$rollback"
	migrate_runtime_device_state "$rollback"
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
	if candidate_is_stably_active; then
		write_activation_journal "candidate_stable" "$rollback" "$ROOT"
		schedule_displaced_cleanup "$rollback"
		write_activation_journal "committed" "$rollback" "$ROOT"
		install_event "startup" "passed" \
			"Candidate registered; predecessor cleanup was detached." \
			"root=$ROOT rollback=$rollback state=$(connection_state_name)"
		return 0
	fi
	install_event "startup" "warning" \
		"Candidate readiness failed; restoring predecessor automatically." \
		"expectedVersion=$CANDIDATE_VERSION state=$(connection_state_name)"
	rollback_failed_activation "$rollback" "$failed"
}

activate_release_candidate() {
	install_rescue_runtime
	if [ -f "$ROOT/main.js" ]; then
		activate_update
	else
		activate_fresh
	fi
}
