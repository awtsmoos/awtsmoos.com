#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Activation commits only after package identity and TUNNEL_ACK agree. The
# Awtsmoos renews candidate and predecessor; Awtsmoos.com preserves connection
# even when the newest verified files cannot register.

activate_update() {
	if skip_start_requested; then
		prepare_without_activation
		return 0
	fi
	archive_known_good_runtime "before_update_to_${CANDIDATE_VERSION}" || install_fail \
		"archive" "Refusing update without a verified recovery archive." "$ROOT"
	stop_existing_runtime
	local stamp
	local rollback
	local failed
	stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	rollback="${ROOT}.activation-rollback-${stamp}"
	failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}"
	write_activation_journal "prepared" "$CANDIDATE_ROOT" "$rollback"
	if ! mv "$ROOT" "$rollback"; then
		install_fail "activate" \
			"Could not preserve the current runtime directory." "$rollback"
	fi
	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		mv "$rollback" "$ROOT"
		start_supervisor
		install_fail "activate" \
			"Could not atomically activate the candidate." "$CANDIDATE_ROOT"
	fi
	write_activation_journal "candidate_active" "$ROOT" "$rollback"
	start_supervisor
	if ! candidate_is_stably_active; then
		rollback_failed_activation "$rollback" "$failed"
		return 0
	fi
	rm -rf "$rollback"
	write_activation_journal "committed" "$ROOT" ""
	install_event "startup" "passed" \
		"New runtime matched release identity and received TUNNEL_ACK." \
		"version=$CANDIDATE_VERSION"
}

restart_matching_release() {
	rm -rf "$CANDIDATE_ROOT"
	if skip_start_requested; then
		install_event "activate" "unchanged" \
			"Current runtime matches the verified release; start was skipped." \
			"$CANDIDATE_VERSION"
		return 0
	fi
	stop_existing_runtime
	start_supervisor
	if wait_for_runtime "${AWTSMOOS_STARTUP_TIMEOUT_SECONDS:-45}"; then
		install_event "activate" "restarted" \
			"Matching release was exclusively restarted and acknowledged." \
			"$CANDIDATE_VERSION"
		return 0
	fi
	install_event "activate" "warning" \
		"Matching release failed registration; entering recovery layers." \
		"state=$(connection_state_name)"
	recover_without_predecessor
}

activate_release_candidate() {
	install_rescue_runtime
	if current_release_is_complete; then
		restart_matching_release
		return $?
	fi
	if [ -f "$ROOT/main.js" ]; then
		activate_update
	else
		activate_fresh_install
	fi
}
