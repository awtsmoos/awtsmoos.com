#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews child and relay testimony together. Awtsmoos.com accepts only
# a fresh registered receipt for the exact PID, friendly name, and immutable route;
# stale or incomplete testimony becomes a reason to heal rather than a false success.

supervisor_expected_tunnel() {
	node - "$ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(config.tunnelName || ""));
} catch {}
NODE
}

supervisor_receipt_stale_ms() {
	printf '%s\n' "${AWTSMOOS_RECEIPT_STALE_MS:-90000}"
}

supervisor_receipt_matches() {
	local pid="$1"
	local max_age_ms="${2:-$(supervisor_receipt_stale_ms)}"
	node - "$ROOT/connection-state.json" "$pid" \
		"$(supervisor_expected_tunnel)" "$max_age_ms" <<'NODE'
const fs = require("node:fs");
const [file, pid, tunnelName, maxAgeText] = process.argv.slice(2);
try {
	const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
	const timestamp = Date.parse(
		receipt.lastServerMessageAt || receipt.updatedAt || ""
	);
	const maxAgeMs = Number(maxAgeText || 0);
	const fresh = Number.isFinite(timestamp) &&
		Date.now() - timestamp <= maxAgeMs;
	const matches = receipt.state === "registered" &&
		Number(receipt.pid) === Number(pid) &&
		receipt.tunnelName === tunnelName &&
		String(receipt.tunnelId || "").startsWith("tun_") &&
		fresh;
	process.exit(matches ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}

supervisor_receipt_state() {
	node - "$ROOT/connection-state.json" <<'NODE'
const fs = require("node:fs");
try {
	const receipt = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const details = {
		state: receipt.state || "unknown",
		reason: receipt.reason || "",
		reconnectAttempt: Number(receipt.reconnectAttempt || 0),
		generation: Number(receipt.generation || 0)
	};
	process.stdout.write(JSON.stringify(details));
} catch {
	process.stdout.write('{"state":"missing"}');
}
NODE
}

device_pairing_pending() {
	node - "$ROOT/device-binding.json" <<'NODE'
const fs = require("node:fs");
try {
	const identity = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.exit(identity?.deviceId && !identity?.tunnelId ? 0 : 1);
} catch {
	process.exit(0);
}
NODE
}
