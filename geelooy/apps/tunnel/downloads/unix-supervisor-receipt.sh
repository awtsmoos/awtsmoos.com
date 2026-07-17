#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews child and relay testimony together. Awtsmoos.com accepts only
# a fresh registered receipt for exact PID, friendly name, and immutable route, while
# bounded mismatch evidence explains every recovery decision without exposing secrets.

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
	const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	const ageMs = Date.now() - timestamp;
	const maxAgeMs = Number(maxAgeText || 0);
	const matches = receipt.state === "registered" &&
		Number(receipt.pid) === Number(pid) &&
		receipt.tunnelName === tunnelName &&
		String(receipt.tunnelId || "").startsWith("tun_") &&
		Number.isFinite(timestamp) && ageMs >= 0 && ageMs <= maxAgeMs;
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
	process.stdout.write(JSON.stringify({
		state: receipt.state || "unknown",
		reason: receipt.reason || "",
		reconnectAttempt: Number(receipt.reconnectAttempt || 0),
		generation: Number(receipt.generation || 0)
	}));
} catch {
	process.stdout.write('{"state":"missing"}');
}
NODE
}

supervisor_receipt_summary() {
	local pid="$1"
	node - "$ROOT/connection-state.json" "$pid" \
		"$(supervisor_expected_tunnel)" "$(supervisor_receipt_stale_ms)" <<'NODE'
const fs = require("node:fs");
const [file, expectedPid, expectedName, maximumAge] = process.argv.slice(2);
let value = {};
try { value = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
const timestamp = Date.parse(value.lastServerMessageAt || value.updatedAt || "");
const ageMs = Number.isFinite(timestamp) ? Date.now() - timestamp : -1;
process.stdout.write([
	`expectedPid=${expectedPid || "missing"}`,
	`receiptPid=${value.pid || "missing"}`,
	`state=${value.state || "missing"}`,
	`expectedName=${expectedName || "missing"}`,
	`receiptName=${value.tunnelName || "missing"}`,
	`tunnelId=${value.tunnelId || "missing"}`,
	`ageMs=${ageMs}`,
	`maximumAgeMs=${maximumAge}`
].join(" "));
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
