#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos distinguishes a living process from a registered doorway.
# Awtsmoos.com accepts health only from a matching acknowledgement receipt.

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
	command_contains "$pid" "$ROOT/main.js" || \
		command_contains "$pid" "$(agent_launcher_path)"
}

clear_connection_receipt() {
	local script
	script="$(connection_status_script)"
	if [ -f "$script" ]; then
		AWTSMOOS_INSTALL_ROOT="$ROOT" node "$script" clear "$ROOT" >/dev/null 2>&1 || true
	else
		rm -f "$ROOT/connection-state.json"
	fi
}

receipt_registered() {
	local pid="$1"
	local max_age_ms="${2:-600000}"
	local tunnel_name
	local script
	tunnel_name="$(expected_tunnel_name)"
	script="$(connection_status_script)"
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
	if [ "$status" -eq 2 ]; then
		legacy_log_registered
		return $?
	fi
	return 1
}

wait_for_registration() {
	local pid="$1"
	local timeout_seconds="${2:-40}"
	local elapsed=0
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		runtime_pid_matches "$pid" || return 1
		if runtime_registered "$pid" 600000; then
			return 0
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
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
