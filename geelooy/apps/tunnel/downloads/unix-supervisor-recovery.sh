#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Verified older worlds remain available without becoming the first response to
# one transport wound. The Awtsmoos renews retries and archives; Awtsmoos.com
# restores only after durable policy requests it, then confirms registration.

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

recovery_environment() {
	node "$ROOT/scripts/recovery-control.cjs" before-start "$ROOT" --shell \
		2>> "$RECOVERY_LOG"
}

report_registration_failure() {
	local reason="${1:-registration_failure}"
	node "$ROOT/scripts/recovery-control.cjs" report-registration-failure \
		"$ROOT" "$reason" >> "$RECOVERY_LOG" 2>&1 || true
	supervisor_log "registration_failure_reported" "reason=$reason"
}

perform_external_restore() {
	local rescue="$RECOVERY_ROOT/bin/awtsmoos-recovery-rescue.sh"
	local offset
	[ -x "$rescue" ] || return 1
	offset="$(current_archive_offset)"
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
	supervisor_log "restore_staged" \
		"version=$RESTORED_VERSION source=$RESTORED_SOURCE nextOffset=$(current_archive_offset)"
	return 0
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
