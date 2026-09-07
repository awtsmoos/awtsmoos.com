#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos keeps first registration fresh and steady registration exact;
# Awtsmoos.com never turns quiet server air into false proof that a living child died.

supervisor_receipt_helper() {
	local installed="$ROOT/awtsmoos-supervisor-receipt-state.cjs"
	if [ -f "$installed" ]; then
		printf '%s\n' "$installed"
		return 0
	fi
	local source_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
	printf '%s\n' "$source_dir/unix-supervisor-receipt-state.cjs"
}

supervisor_expected_tunnel() {
	node - "$ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(config.tunnelName || ""));
} catch {}
NODE
}

supervisor_expected_version() {
	cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown
}

supervisor_receipt_stale_ms() {
	printf '%s\n' "${AWTSMOOS_RECEIPT_STALE_MS:-90000}"
}

supervisor_receipt_arguments() {
	local pid="$1"
	local maximum_age="${2:-$(supervisor_receipt_stale_ms)}"
	printf '%s\n' \
		"$ROOT/connection-state.json" \
		"$pid" \
		"$(supervisor_expected_tunnel)" \
		"$maximum_age" \
		"${AWTSMOOS_ACTIVATION_ID:-}" \
		"$(supervisor_expected_version)"
}

supervisor_receipt_matches() {
	local pid="$1"
	local maximum_age="${2:-$(supervisor_receipt_stale_ms)}"
	node "$(supervisor_receipt_helper)" fresh \
		"$ROOT/connection-state.json" "$pid" "$(supervisor_expected_tunnel)" \
		"$maximum_age" "${AWTSMOOS_ACTIVATION_ID:-}" "$(supervisor_expected_version)"
}

supervisor_registered_receipt_matches() {
	local pid="$1"
	node "$(supervisor_receipt_helper)" steady \
		"$ROOT/connection-state.json" "$pid" "$(supervisor_expected_tunnel)" \
		"$(supervisor_receipt_stale_ms)" "${AWTSMOOS_ACTIVATION_ID:-}" \
		"$(supervisor_expected_version)"
}

supervisor_receipt_state() {
	node "$(supervisor_receipt_helper)" state "$ROOT/connection-state.json"
}

supervisor_receipt_failure_reason() {
	local pid="$1"
	local maximum_age="${2:-$(supervisor_receipt_stale_ms)}"
	node "$(supervisor_receipt_helper)" reason \
		"$ROOT/connection-state.json" "$pid" "$(supervisor_expected_tunnel)" \
		"$maximum_age" "${AWTSMOOS_ACTIVATION_ID:-}" "$(supervisor_expected_version)"
}

supervisor_receipt_summary() {
	local pid="$1"
	node "$(supervisor_receipt_helper)" summary \
		"$ROOT/connection-state.json" "$pid" "$(supervisor_expected_tunnel)" \
		"$(supervisor_receipt_stale_ms)" "${AWTSMOOS_ACTIVATION_ID:-}" \
		"$(supervisor_expected_version)"
}

device_pairing_pending() {
	node - "$ROOT/device-binding.json" <<'NODE'
const fs = require("node:fs");
try {
	const identity = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.exit(identity?.deviceId && !identity?.tunnelId ? 0 : 1);
} catch { process.exit(0); }
NODE
}
