#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Activation preserves the exact predecessor by atomic rename. Building a second
# archive before startup is redundant, slow, and dangerous when mutable caches are
# large. Recovery archives remain optional historical witnesses after readiness.
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
	install_progress 69 "Preserving exact predecessor for instant rollback"
	install_event "archive" "skipped" \
		"Blocking predecessor archive is unnecessary; atomic rollback is authoritative." \
		"root=$ROOT rollback=$rollback candidate=$CANDIDATE_VERSION"
	install_progress 74 "Switching to the verified release"
	write_activation_journal "rollback_prepared" "$rollback" "$CANDIDATE_ROOT"
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
		"Candidate readiness failed; restoring exact predecessor automatically." \
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
