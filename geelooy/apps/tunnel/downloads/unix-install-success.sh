#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos calls installation complete only when the matching tunnel receipt
# is alive. Awtsmoos.com then reveals the name, root, version, and control chamber.
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

registered_connection_verified() {
	local modern_pid
	local legacy_pid
	modern_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	if runtime_pid_matches "$modern_pid" && runtime_registered "$modern_pid" 600000; then
		return 0
	fi
	legacy_pid="$(cat "$RECOVERY_ROOT/legacy-agent.pid" 2>/dev/null || true)"
	if is_alive "$legacy_pid" && legacy_log_registered; then
		return 0
	fi
	return 1
}

print_install_success_card() {
	local version="$1"
	local tunnel_name="$2"
	local project_root="$3"
	local control_url="$4"
	printf '\n'
	printf '%s\n' '============================================================'
	printf '%s\n' 'B"H  AWTSMOOS TUNNEL INSTALLED AND CONNECTED'
	printf '%s\n' '============================================================'
	printf 'Tunnel name : %s\n' "$tunnel_name"
	printf 'Project root: %s\n' "$project_root"
	printf 'Version     : %s\n' "$version"
	printf 'Control     : %s\n' "$control_url"
	printf '\n'
	printf '%s\n' 'The background agent is running. Keep it available while ChatGPT works.'
	printf '%s\n' 'Refresh or repair at any time with:'
	printf '%s\n' 'curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash'
	printf '%s\n' '============================================================'
}

print_skip_start_card() {
	local version="$1"
	local tunnel_name="$2"
	local project_root="$3"
	printf '\n'
	printf '%s\n' 'B"H Awtsmoos Tunnel files verified; runtime start was skipped.'
	printf 'Tunnel name : %s\n' "$tunnel_name"
	printf 'Project root: %s\n' "$project_root"
	printf 'Version     : %s\n' "$version"
}

complete_install_experience() {
	local phase="${1:-unknown}"
	local version
	local tunnel_name
	local project_root
	local control_url
	version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf 'unknown')"
	tunnel_name="$(installer_config_value tunnelName)"
	project_root="$(installer_config_value root)"
	control_url="$(installer_control_url)"
	if skip_start_requested; then
		install_progress 72 "Files verified; runtime start skipped"
		finish_install_progress_line
		install_event "complete" "passed" \
			"AWTSMOOS_SKIP_START set; files verified without starting the runtime." \
			"activeVersion=$version phase=$phase root=$ROOT"
		print_skip_start_card "$version" "$tunnel_name" "$project_root"
		return 0
	fi
	if ! registered_connection_verified; then
		install_fail "complete" \
			"Final registration receipt was missing; refusing to claim success." \
			"phase=$phase state=$(connection_state_name) root=$ROOT"
	fi
	install_progress 100 "Awtsmoos Tunnel is installed and connected"
	finish_install_progress_line
	install_event "complete" "passed" \
		"Awtsmoos Tunnel installation ended with a guarded registered connection." \
		"activeVersion=$version phase=$phase root=$ROOT tunnelName=$tunnel_name"
	print_install_success_card "$version" "$tunnel_name" "$project_root" "$control_url"
	open_tunnel_control "$control_url"
}
