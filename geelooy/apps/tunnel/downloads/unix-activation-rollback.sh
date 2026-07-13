#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Rollback requires registration at every tier. The Awtsmoos renews predecessor,
# archive, and legacy bridge; Awtsmoos.com clears failure memory only after a
# sustained registered runtime has replaced the failed candidate.

mark_runtime_restored() {
	local version="${1:-unknown}"
	local source="${2:-rollback}"
	if [ -f "$ROOT/scripts/recovery-control.cjs" ]; then
		node "$ROOT/scripts/recovery-control.cjs" mark-restored \
			"$ROOT" "$version" "$source" >/dev/null 2>&1 || true
	fi
}

restore_exact_predecessor() {
	local rollback="$1"
	local failed="$2"
	stop_existing_runtime || true
	[ -e "$ROOT" ] && mv "$ROOT" "$failed"
	[ -e "$rollback" ] || return 1
	mv "$rollback" "$ROOT" || return 1
	start_supervisor
	if ! wait_for_runtime "${AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS:-45}"; then
		return 1
	fi
	mark_runtime_restored \
		"$(cat "$ROOT/install-state.txt" 2>/dev/null || printf 'unknown')" \
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
		install_event "rollback" "attempt" \
			"Trying verified recovery archive." "offset=$offset"
		if "$rescue" "$ROOT" "$RECOVERY_ROOT" "$offset"; then
			start_supervisor
			if wait_for_runtime "${AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS:-45}"; then
				mark_runtime_restored \
					"$(cat "$ROOT/install-state.txt" 2>/dev/null || printf 'unknown')" \
					"archive_offset_$offset"
				install_event "rollback" "passed" \
					"Verified archive registered successfully." "offset=$offset"
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
	if restore_archive_layers || restore_legacy_layer; then
		write_activation_journal "fallback_connected" "$ROOT" ""
		return 0
	fi
	install_fail "rollback" \
		"No modern archive or legacy bridge could register." "$RECOVERY_ROOT"
}

rollback_failed_activation() {
	local rollback="$1"
	local failed="$2"
	if restore_exact_predecessor "$rollback" "$failed"; then
		write_activation_journal "rolled_back" "$failed" "$ROOT"
		install_event "rollback" "passed" \
			"Exact predecessor registered after candidate failure." "$ROOT"
		return 0
	fi
	install_event "rollback" "warning" \
		"Exact predecessor failed registration; descending recovery layers." "$rollback"
	if restore_archive_layers || restore_legacy_layer; then
		write_activation_journal "fallback_connected" "$failed" "$ROOT"
		return 0
	fi
	install_fail "rollback" \
		"Every predecessor, archive, and legacy recovery layer failed." \
		"failed=$failed recovery=$RECOVERY_ROOT"
}
