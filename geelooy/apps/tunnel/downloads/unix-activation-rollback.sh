#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Rollback starts each predecessor with its preserved supervisor contract, then
# accepts success only after registration, root proof, and guardianship agree.
mark_runtime_restored() {
	local version="${1:-unknown}"
	local source="${2:-rollback}"
	if [ -f "$ROOT/scripts/recovery-control.cjs" ]; then
		node "$ROOT/scripts/recovery-control.cjs" mark-restored \
			"$ROOT" "$version" "$source" >/dev/null 2>&1 || true
	fi
}

restored_runtime_ready() {
	local timeout_seconds="${1:-45}"
	wait_for_runtime "$timeout_seconds" || return 1
	local agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	ensure_rollback_project_root_receipt "$agent_pid" || return 1
	wait_for_service_supervision 15 || return 1
}

restore_exact_predecessor() {
	local rollback="$1"
	local failed="$2"
	stop_existing_runtime || true
	[ -e "$ROOT" ] && mv "$ROOT" "$failed"
	[ -e "$rollback" ] || return 1
	mv "$rollback" "$ROOT" || return 1
	start_restored_supervisor || return 1
	restored_runtime_ready "${AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS:-45}" || return 1
	mark_runtime_restored \
		"$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)" \
		"exact_predecessor"
	return 0
}

restore_archive_layers() {
	local rescue="$RECOVERY_ROOT/bin/awtsmoos-recovery-rescue.sh"
	local attempts="${AWTSMOOS_RECOVERY_ATTEMPTS:-5}"
	local offset=0
	[ -x "$rescue" ] || return 1
	while [ "$offset" -lt "$attempts" ]; do
		stop_existing_runtime || true
		install_event "rollback" "attempt" "Trying verified recovery archive." "offset=$offset"
		if "$rescue" "$ROOT" "$RECOVERY_ROOT" "$offset"; then
			if start_restored_supervisor &&
				restored_runtime_ready "${AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS:-45}"; then
				mark_runtime_restored \
					"$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)" \
					"archive_offset_$offset"
				install_event "rollback" "passed" \
					"Verified archive restarted and proved workspace readiness." \
					"offset=$offset"
				return 0
			fi
		fi
		offset=$(( offset + 1 ))
	done
	return 1
}

restore_legacy_layer() {
	stop_existing_runtime || true
	if start_legacy_fallback; then
		install_event "rollback" "degraded" \
			"Modern archives failed; emergency legacy bridge registered." \
			"$ROOT/legacy-agent.log"
		return 0
	fi
	return 1
}

recover_without_predecessor() {
	if restore_archive_layers; then
		write_activation_journal "rolled_back" "$ROOT" "$ROOT"
		return 0
	fi
	if restore_legacy_layer; then
		write_activation_journal "fallback_connected" "$ROOT" ""
		return 0
	fi
	install_fail "rollback" "No modern archive or legacy bridge could register." "$RECOVERY_ROOT"
}

rollback_failed_activation() {
	local rollback="$1"
	local failed="$2"
	if restore_exact_predecessor "$rollback" "$failed"; then
		write_activation_journal "rolled_back" "$failed" "$ROOT"
		install_event "rollback" "passed" \
			"Exact predecessor restarted with root and guardian readiness." "$ROOT"
		return 0
	fi
	install_event "rollback" "warning" \
		"Exact predecessor failed readiness; trying verified archives." "$rollback"
	if restore_archive_layers; then
		write_activation_journal "rolled_back" "$failed" "$ROOT"
		return 0
	fi
	if restore_legacy_layer; then
		write_activation_journal "fallback_connected" "$failed" "$ROOT"
		return 0
	fi
	install_fail "rollback" \
		"Every predecessor, archive, and legacy recovery layer failed." \
		"failed=$failed recovery=$RECOVERY_ROOT"
}
