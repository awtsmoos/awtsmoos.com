#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos crowns a verified tunnel with one durable recovery doorway.
installer_config_value() {
	local key="$1"
	node - "$ROOT/config.json" "$key" <<'NODE'
const fs = require("node:fs");
const [file, key] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value[key] ?? ""));
} catch {}
NODE
}

connection_receipt_value() {
	local key="$1"
	node - "$ROOT/connection-state.json" "$key" <<'NODE'
const fs = require("node:fs");
const [file, key] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value[key] ?? ""));
} catch {}
NODE
}

workspace_status_label() {
	local agent_pid="$1"
	local activation_id="$(connection_receipt_value activationId)"
	if project_root_ready "$agent_pid" 600000 "$activation_id"; then
		printf '%s\n' 'available'
	elif project_root_receipt_matches_runtime "$agent_pid" "$activation_id" &&
		local_runtime_action_ready; then
		printf '%s\n' 'available'
	else
		printf '%s\n' 'unavailable (optional; tunnel remains healthy)'
	fi
}

print_install_success_card() {
	local version="$1"
	local tunnel_name="$2"
	local tunnel_id="$3"
	local project_root="$4"
	local workspace_status="$5"
	local control_url="$6"
	printf '\n%s\n' '============================================================'
	printf '%s\n' 'B"H  AWTSMOOS TUNNEL VERIFIED, GUARDED, AND CONNECTED'
	printf '%s\n' '============================================================'
	printf 'Tunnel name : %s\n' "$tunnel_name"
	printf 'Tunnel ID   : %s\n' "$tunnel_id"
	printf 'Workspace   : %s\n' "$project_root"
	printf 'Workspace   : %s\n' "$workspace_status"
	printf 'Guardian    : %s\n' "$(service_health_summary)"
	printf 'Version     : %s\n' "$version"
	printf 'Control     : %s\n\n' "$control_url"
	printf '%s\n' 'Durable local repair:'
	printf '%s\n' "$ROOT/awtsmoos-tunnel-service.sh repair"
	printf '%s\n' 'Full reinstall or upgrade:'
	printf '%s\n' 'curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash'
	printf '%s\n' '============================================================'
}

print_skip_start_card() {
	local version="$1"
	local tunnel_name="$2"
	local project_root="$3"
	printf '\n%s\n' 'B"H Awtsmoos Tunnel files verified; runtime start was skipped.'
	printf 'Tunnel name : %s\n' "$tunnel_name"
	printf 'Workspace   : %s (optional)\n' "$project_root"
	printf 'Version     : %s\n' "$version"
}

complete_install_experience() {
	local phase="${1:-unknown}"
	local version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	local tunnel_name="$(installer_config_value tunnelName)"
	local project_root="$(installer_config_value root)"
	local control_url="$(installer_control_url)"
	local tunnel_id=""
	local agent_pid=""
	local workspace_status=""
	if skip_start_requested; then
		install_progress 72 "Files verified; runtime start skipped"
		finish_install_progress_line
		install_event "complete" "passed" \
			"Runtime start skipped by explicit request." \
			"activeVersion=$version phase=$phase root=$ROOT"
		print_skip_start_card "$version" "$tunnel_name" "$project_root"
		return 0
	fi
	agent_pid="$(verified_agent_pid || true)"
	[ -n "$agent_pid" ] || install_fail "complete" \
		"Registration or durable guardian did not converge." \
		"phase=$phase $(final_readiness_failure_detail)"
	tunnel_id="$(connection_receipt_value tunnelId)"
	[ -n "$tunnel_id" ] || install_fail "complete" \
		"Registration did not provide an authoritative tunnel ID." "pid=$agent_pid"
	wait_for_service_supervision 5 || install_fail "complete" \
		"Durable guardian did not remain singular at final display." \
		"pid=$agent_pid $(service_health_summary)"
	workspace_status="$(workspace_status_label "$agent_pid")"
	install_progress 100 "Awtsmoos Tunnel is fully verified and guarded"
	finish_install_progress_line
	install_event "complete" "passed" \
		"Installation ended with relay and guardian readiness." \
		"version=$version phase=$phase pid=$agent_pid tunnelId=$tunnel_id workspace=$workspace_status"
	print_install_success_card "$version" "$tunnel_name" "$tunnel_id" \
		"$project_root" "$workspace_status" "$control_url"
	open_tunnel_control "$control_url"
}
