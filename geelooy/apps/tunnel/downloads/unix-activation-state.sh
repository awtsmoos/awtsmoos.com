#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

skip_start_requested() {
	[ "${AWTSMOOS_SKIP_START:-}" = "1" ] || \
		[ "${AWTSMOOS_SKIP_START:-}" = "true" ]
}

write_activation_journal() {
	local phase="$1"
	local candidate="$2"
	local rollback="${3:-}"
	local journal="$RECOVERY_ROOT/transactions/install-current.json"
	mkdir -p "$(dirname "$journal")"

	node - "$journal" "$phase" "$candidate" "$rollback" "$CANDIDATE_VERSION" <<'NODE'
const fs = require("node:fs");
const [file, phase, candidate, rollback, version] = process.argv.slice(2);
fs.writeFileSync(file, `${JSON.stringify({
	at: new Date().toISOString(),
	phase,
	candidate,
	rollback,
	version
}, null, 2)}\n`);
NODE
}

current_release_is_complete() {
	[ -f "$ROOT/main.js" ] || return 1
	[ "$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" = "$CANDIDATE_VERSION" ] || return 1
	[ "$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')" = "$MANIFEST_SHA" ] || return 1
	runtime_probe_compatible "$ROOT"
}

candidate_is_stably_active() {
	wait_for_runtime "${AWTSMOOS_STARTUP_TIMEOUT_SECONDS:-20}" && \
		current_release_is_complete
}

prepare_without_activation() {
	local prepared="${ROOT}.prepared-${CANDIDATE_VERSION}-$(date -u +%Y%m%dT%H%M%SZ)"
	mv "$CANDIDATE_ROOT" "$prepared"
	write_activation_journal "prepared_not_activated" "$prepared" ""
	install_event "activate" "prepared" \
		"Verified update preserved without stopping the active tunnel." "$prepared"
}
