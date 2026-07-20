#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Project-root testimony must belong to this process, activation, version, and
# canonical configured directory. Exact JSON evidence survives every failure.
project_root_receipt_path() {
	printf '%s\n' "$ROOT/project-root-state.json"
}

project_root_ready() {
	local pid="$1"
	local max_age_ms="${2:-600000}"
	node - "$ROOT/config.json" "$(project_root_receipt_path)" "$ROOT/install-state.txt" \
		"$pid" "$max_age_ms" "${AWTSMOOS_ACTIVATION_ID:-}" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [configFile, receiptFile, versionFile, expectedPid, maxAge, activationId] = process.argv.slice(2);
const canonical = value => {
	const resolved = path.resolve(String(value || ""));
	try { return fs.realpathSync(resolved); } catch { return resolved; }
};
try {
	const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
	const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
	const version = fs.readFileSync(versionFile, "utf8").trim();
	const age = Date.now() - Date.parse(receipt.updatedAt || "");
	const valid = receipt.ok === true && receipt.state === "ready" &&
		Number(receipt.pid) === Number(expectedPid) &&
		canonical(receipt.canonicalRoot || receipt.root) === canonical(config.root) &&
		receipt.runtimeVersion === version &&
		(!activationId || receipt.activationId === activationId) &&
		receipt.readable === true &&
		(config.allowWrite !== true || receipt.writable === true) &&
		Number.isFinite(age) && age >= 0 && age <= Number(maxAge);
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
} catch { process.stdout.write("missing"); }
NODE
}

project_root_failure_detail() {
	local expected_pid="${1:-}"
	local command="$(process_command "$expected_pid" | tr '\n' ' ' | cut -c1-500)"
	node - "$ROOT/config.json" "$(project_root_receipt_path)" "$ROOT/install-state.txt" \
		"$expected_pid" "$command" "${AWTSMOOS_ACTIVATION_ID:-}" <<'NODE'
const fs = require("node:fs");
const [configFile, receiptFile, versionFile, expectedPid, command, activationId] = process.argv.slice(2);
const read = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } };
const config = read(configFile, {});
const response = read(receiptFile, { state: "missing" });
let version = "missing";
try { version = fs.readFileSync(versionFile, "utf8").trim(); } catch {}
const reason = response.ok === true && response.state === "ready" ? "ready" :
	response.message || response.code ||
	(response.state === "missing" ? "project_root_receipt_missing" : "receipt_identity_mismatch");
process.stdout.write(JSON.stringify({
	request: response.request || { action: "projectRootProbe", root: config.root },
	root: config.root || "missing",
	response,
	processIdentity: { expectedPid: Number(expectedPid || 0), receiptPid: Number(response.pid || 0), command, activationId },
	runtimeVersion: { installed: version, reported: response.runtimeVersion || "missing" },
	failureReason: reason
}));
NODE
}

project_root_health_summary() {
	project_root_failure_detail "${1:-$(cat "$ROOT/agent.pid" 2>/dev/null || true)}"
}

clear_project_root_receipt() {
	rm -f "$(project_root_receipt_path)"
}
