#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos distinguishes a registered doorway from a usable workspace.
# Awtsmoos.com samples quickly through initialization, binds the receipt to the exact
# process, and accepts only fresh proof of the configured root and write requirement.

project_root_receipt_path() {
	printf '%s\n' "$ROOT/project-root-state.json"
}

project_root_ready() {
	local pid="$1"
	local max_age_ms="${2:-600000}"
	node - "$ROOT/config.json" "$(project_root_receipt_path)" \
		"$pid" "$max_age_ms" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [configFile, receiptFile, expectedPid, maxAgeValue] = process.argv.slice(2);
try {
	const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
	const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
	const expectedRoot = path.resolve(String(config.root || process.cwd()));
	const age = Date.now() - Date.parse(receipt.updatedAt || "");
	const valid = receipt.ok === true && receipt.state === "ready" &&
		Number(receipt.pid) === Number(expectedPid) &&
		path.resolve(String(receipt.root || "")) === expectedRoot &&
		receipt.readable === true &&
		(config.allowWrite !== true || receipt.writable === true) &&
		Number.isFinite(age) && age >= 0 && age <= Number(maxAgeValue);
	process.exit(valid ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}

wait_for_project_root_readiness() {
	local pid="$1"
	local timeout_seconds="${2:-30}"
	local max_age_ms="${3:-600000}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local sample=0
	while [ "$sample" -lt "$maximum_samples" ]; do
		project_root_ready "$pid" "$max_age_ms" && return 0
		runtime_pid_matches "$pid" || return 1
		case "$(project_root_health_state)" in
			blocked|probe_error) return 1 ;;
		esac
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	return 1
}

project_root_health_state() {
	node - "$(project_root_receipt_path)" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.state || "unknown"));
} catch {
	process.stdout.write("missing");
}
NODE
}

project_root_health_summary() {
	node - "$(project_root_receipt_path)" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write([
		`state=${value.state || "unknown"}`,
		`pid=${value.pid || "unknown"}`,
		`root=${value.root || "unknown"}`,
		`code=${value.code || "none"}`,
		`guidance=${value.guidance || "none"}`
	].join(" "));
} catch {
	process.stdout.write("state=missing");
}
NODE
}

clear_project_root_receipt() {
	rm -f "$(project_root_receipt_path)"
}
