#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# Rollback restores the exact displaced directory first, then descends to the
# external multi-version rescue only when that verified predecessor cannot awaken.
rollback_failed_activation() {
	local rollback="$1"
	local failed="$2"
	local rescue="$RECOVERY_ROOT/bin/awtsmoos-recovery-rescue.sh"

	stop_existing_runtime || true
	[ -e "$ROOT" ] && mv "$ROOT" "$failed"
	if ! mv "$rollback" "$ROOT"; then
		install_fail "rollback" "Could not restore the previous runtime directory." "$rollback"
	fi

	start_supervisor
	if ! wait_for_runtime "${AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS:-20}"; then
		install_event "rollback" "warning" \
			"Previous directory did not restart; invoking external version recovery." "$rescue"
		stop_existing_runtime || true
		"$rescue" "$ROOT" "$RECOVERY_ROOT" "0" || install_fail \
			"rollback" "No verified recovery version could be started." "$RECOVERY_ROOT/versions"
		start_supervisor
		wait_for_runtime "${AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS:-20}" || install_fail \
			"rollback" "Recovered version still failed its startup gate." "$ROOT/agent.log"
	fi

	write_activation_journal "rolled_back" "$failed" "$ROOT"
	install_event "rollback" "passed" "Previous verified runtime is running again." "$ROOT"
	return 1
}
