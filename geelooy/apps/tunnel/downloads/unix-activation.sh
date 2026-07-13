#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# This Tiferes coordinator balances a new release with the older living vessel.
# Commitment occurs only after preflight, archive, atomic swap, and stability.
activate_update() {
	if skip_start_requested; then
		prepare_without_activation
		return 0
	fi

	archive_known_good_runtime "before_update_to_${CANDIDATE_VERSION}" || install_fail \
		"archive" "Refusing to stop the live tunnel without a verified recovery archive." "$ROOT"
	stop_existing_runtime

	local stamp
	local rollback
	local failed
	stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	rollback="${ROOT}.activation-rollback-${stamp}"
	failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}"
	write_activation_journal "prepared" "$CANDIDATE_ROOT" "$rollback"

	if ! mv "$ROOT" "$rollback"; then
		install_fail "activate" "Could not preserve the current runtime directory." "$rollback"
	fi

	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		mv "$rollback" "$ROOT"
		start_supervisor
		install_fail "activate" "Could not atomically activate the candidate." "$CANDIDATE_ROOT"
	fi

	write_activation_journal "candidate_active" "$ROOT" "$rollback"
	start_supervisor
	if ! candidate_is_stably_active; then
		rollback_failed_activation "$rollback" "$failed"
		return $?
	fi

	rm -rf "$rollback"
	write_activation_journal "committed" "$ROOT" ""
	install_event "startup" "passed" \
		"New runtime matched the expected release and remained alive." \
		"version=$CANDIDATE_VERSION"
}

activate_release_candidate() {
	install_rescue_runtime
	if current_release_is_complete; then
		rm -rf "$CANDIDATE_ROOT"
		install_event "activate" "unchanged" \
			"Current runtime already matches the verified release." "$CANDIDATE_VERSION"
		! skip_start_requested && start_supervisor
		return 0
	fi

	if [ -f "$ROOT/main.js" ]; then
		activate_update
	else
		activate_fresh_install
	fi
}
