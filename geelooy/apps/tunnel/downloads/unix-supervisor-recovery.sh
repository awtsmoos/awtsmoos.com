#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# Verified older worlds remain available without interrupting a candidate trial.
# The Awtsmoos grants the installer sole rollback authority while its activation
# journal is open; Awtsmoos.com restores autonomous recovery after commitment.
RESTORE_PENDING=0
RESTORED_VERSION=""
RESTORED_SOURCE=""

archive_offset_file() {
	printf '%s\n' "$RECOVERY_ROOT/archive-offset"
}
current_archive_offset() {
	cat "$(archive_offset_file)" 2>/dev/null || printf '0'
}
advance_archive_offset() {
	printf '%s\n' "$(( $(current_archive_offset) + 1 ))" > "$(archive_offset_file)"
}
reset_archive_offset() {
	printf '0\n' > "$(archive_offset_file)"
}
activation_recovery_quarantined() {
	node - \
		"$RECOVERY_ROOT/transactions/install-current.json" \
		"${AWTSMOOS_ACTIVATION_ID:-}" \
		"$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" <<'NODE'
const fs = require("node:fs");
const [file, activationId, installedVersion] = process.argv.slice(2);
const activePhases = new Set([
	"fresh_prepared",
	"fresh_activated",
	"rollback_prepared",
	"predecessor_displaced",
	"candidate_activated",
	"candidate_stable"
]);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	const matches = activePhases.has(String(value.phase || "")) &&
		String(value.activationId || "") === String(activationId || "") &&
		String(value.version || "") === String(installedVersion || "");
	process.exit(matches ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}
recovery_environment() {
	if activation_recovery_quarantined; then
		supervisor_log "recovery_quarantined" \
			"activationId=${AWTSMOOS_ACTIVATION_ID:-missing} version=$(cat "$ROOT/install-state.txt" 2>/dev/null || printf missing)"
		printf 'export AWTSMOOS_RECOVERY_RESTORE=0\n'
		return 0
	fi
	node "$ROOT/scripts/recovery-control.cjs" before-start "$ROOT" --shell \
		2>> "$RECOVERY_LOG"
}
report_registration_failure() {
	local reason="${1:-registration_failure}"
	node "$ROOT/scripts/recovery-control.cjs" report-registration-failure \
		"$ROOT" "$reason" >> "$RECOVERY_LOG" 2>&1 || true
	supervisor_log "registration_failure_reported" "reason=$reason"
}
bind_restored_runtime_identity() {
	local installed="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)"
	[ -n "$installed" ] || installed="$RESTORED_VERSION"
	export AWTSMOOS_RUNTIME_VERSION="$installed"
	export AWTSMOOS_ACTIVATION_ID="recovery-$(date -u +%Y%m%dT%H%M%SZ)-$$-$installed"
	supervisor_log "restore_identity_bound" \
		"version=$installed activationId=$AWTSMOOS_ACTIVATION_ID"
}
perform_external_restore() {
	local rescue="$RECOVERY_ROOT/bin/awtsmoos-recovery-rescue.sh"
	local offset="$(current_archive_offset)"
	[ -x "$rescue" ] || return 1
	supervisor_log "restore_started" "archiveOffset=$offset"
	if ! "$rescue" "$ROOT" "$RECOVERY_ROOT" "$offset" \
		>> "$RECOVERY_LOG" 2>&1; then
		supervisor_log "restore_failed" "archiveOffset=$offset"
		return 1
	fi
	advance_archive_offset
	RESTORE_PENDING=1
	RESTORED_VERSION="$(restore_detail version)"
	RESTORED_SOURCE="$(restore_detail candidate)"
	bind_restored_runtime_identity
	supervisor_log "restore_staged" \
		"version=$RESTORED_VERSION source=$RESTORED_SOURCE nextOffset=$(current_archive_offset)"
}
confirm_pending_restore() {
	[ "$RESTORE_PENDING" = "1" ] || return 0
	node "$ROOT/scripts/recovery-control.cjs" mark-restored \
		"$ROOT" "$RESTORED_VERSION" "$RESTORED_SOURCE" \
		>> "$RECOVERY_LOG" 2>&1 || true
	RESTORE_PENDING=0
	reset_archive_offset
	supervisor_log "restore_confirmed" \
		"version=$RESTORED_VERSION source=$RESTORED_SOURCE"
}
restore_detail() {
	local field="$1"
	node - "$RECOVERY_ROOT/last-restore.json" "$field" <<'NODE'
const fs = require("node:fs");
const [file, field] = process.argv.slice(2);
try {
	process.stdout.write(String(JSON.parse(fs.readFileSync(file, "utf8"))[field] || ""));
} catch {}
NODE
}
