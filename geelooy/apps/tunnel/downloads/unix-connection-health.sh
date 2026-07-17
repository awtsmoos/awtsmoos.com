#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos distinguishes a living process from a registered doorway.
# Awtsmoos.com accepts health only from a matching acknowledgement receipt and emits
# bounded mismatch evidence so repair never collapses into a vague timeout.
connection_status_script() {
	printf '%s\n' "$ROOT/scripts/connection-status.cjs"
}
agent_launcher_path() {
	printf '%s\n' "$ROOT/awtsmoos-agent-launcher.cjs"
}
expected_tunnel_name() {
	node - "$ROOT/config.json" <<'NODE'
const fs = require("node:fs");
try {
	const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(config.tunnelName || ""));
} catch {}
NODE
}
runtime_pid_matches() {
	local pid="$1"
	command_contains "$pid" "$ROOT/main.js" ||
		command_contains "$pid" "$(agent_launcher_path)"
}
clear_connection_receipt() {
	local script="$(connection_status_script)"
	if [ -f "$script" ]; then
		AWTSMOOS_INSTALL_ROOT="$ROOT" node "$script" clear "$ROOT" >/dev/null 2>&1 || true
	else
		rm -f "$ROOT/connection-state.json"
	fi
}
receipt_registered() {
	local pid="$1"
	local max_age_ms="${2:-600000}"
	local tunnel_name="$(expected_tunnel_name)"
	local script="$(connection_status_script)"
	[ -n "$tunnel_name" ] || return 1
	[ -f "$script" ] || return 2
	AWTSMOOS_INSTALL_ROOT="$ROOT" node "$script" check "$ROOT" \
		"$pid" "$tunnel_name" "$max_age_ms" >/dev/null 2>&1
}
legacy_log_registered() {
	grep -Eq 'tunnel registered:|Awtsmoos tunnel connected\.' \
		"$ROOT/agent.log" "$ROOT/legacy-agent.log" 2>/dev/null
}
runtime_registered() {
	local pid="$1"
	local max_age_ms="${2:-600000}"
	if receipt_registered "$pid" "$max_age_ms"; then
		return 0
	fi
	local status=$?
	[ "$status" -eq 2 ] || return 1
	legacy_log_registered
}
runtime_health_summary() {
	local pid="${1:-$(cat "$ROOT/agent.pid" 2>/dev/null || true)}"
	local command="$(process_command "$pid" | tr '\n' ' ' | cut -c1-500)"
	local pid_match=0
	local receipt_match=0
	runtime_pid_matches "$pid" && pid_match=1
	runtime_registered "$pid" 600000 && receipt_match=1
	node - "$ROOT/connection-state.json" "$pid" "$pid_match" "$receipt_match" \
		"$(expected_tunnel_name)" "$command" <<'NODE'
const fs = require("node:fs");
const [file, pid, pidMatch, receiptMatch, expectedName, command] = process.argv.slice(2);
let receipt = {};
try { receipt = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
const ageMs = Number.isFinite(timestamp) ? Date.now() - timestamp : -1;
process.stdout.write([
	`pid=${pid || "missing"}`,
	`pidMatch=${pidMatch}`,
	`receiptMatch=${receiptMatch}`,
	`receiptPid=${receipt.pid || "missing"}`,
	`state=${receipt.state || "missing"}`,
	`expectedName=${expectedName || "missing"}`,
	`receiptName=${receipt.tunnelName || "missing"}`,
	`tunnelId=${receipt.tunnelId || "missing"}`,
	`ageMs=${ageMs}`,
	`command=${command || "missing"}`
].join(" "));
NODE
}
wait_for_registration() {
	local pid="$1"
	local timeout_seconds="${2:-40}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local sample=0
	while [ "$sample" -lt "$maximum_samples" ]; do
		runtime_pid_matches "$pid" || return 1
		runtime_registered "$pid" 600000 && return 0
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	return 1
}
connection_state_name() {
	node - "$ROOT/connection-state.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.state || "unknown"));
} catch {
	process.stdout.write("missing");
}
NODE
}
