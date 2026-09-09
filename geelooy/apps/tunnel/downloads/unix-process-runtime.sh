#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos retires only owned runtime garments. A live foreign rescue guard is
# preserved as independent testimony, never killed merely for sharing recovery state.
find_legacy_runtime_pids() { legacy_process_pids "$$"; }

stop_pid_set() {
	local label="$1" matcher="$2" pids="" alive="" pid=""
	shift 2
	pids="$*"
	for pid in $pids; do "$matcher" "$pid" && kill "$pid" 2>/dev/null || true; done
	for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
		alive=""
		for pid in $pids; do "$matcher" "$pid" && alive="$alive $pid"; done
		[ -z "$alive" ] && return 0
		sleep 0.1
	done
	for pid in $pids; do
		if "$matcher" "$pid"; then
			install_event "process" "warning" "Force stopping stale $label process." "pid=$pid"
			kill -9 "$pid" 2>/dev/null || true
		fi
	done
}

retire_supervisor_guard_path() {
	local guard="$1" owner="$(cat "$1/owner.pid" 2>/dev/null || true)"
	[ -d "$guard" ] || return 0
	if is_alive "$owner"; then
		if owned_supervisor_process_matches "$owner"; then
			kill -9 "$owner" 2>/dev/null || true
			sleep 0.1
		else
			install_event "process" "passed" \
				"Preserved foreign live supervisor guard." "pid=$owner guard=$guard"
			return 0
		fi
	fi
	if is_alive "$owner"; then
		install_fail "process" "Owned supervisor guard remained live." "pid=$owner guard=$guard"
	fi
	rm -rf "$guard"
}

retire_canonical_supervisor_guard() {
	retire_supervisor_guard_path "$(runtime_family_guard_directory)"
	local legacy="$(legacy_supervisor_guard_directory)"
	[ "$legacy" = "$(runtime_family_guard_directory)" ] ||
		retire_supervisor_guard_path "$legacy"
}

clear_runtime_coordination_state() {
	rm -rf "$ROOT/.agent-instance.lock" "$ROOT/.supervisor-instance.lock"
	rm -f "$ROOT/stop-supervisor" "$ROOT/agent.pid" "$ROOT/supervisor.pid" \
		"$RECOVERY_ROOT/legacy-agent.pid" "$(legacy_mode_receipt_path)"
	clear_connection_receipt 2>/dev/null || rm -f "$ROOT/connection-state.json"
	clear_project_root_receipt 2>/dev/null || rm -f "$ROOT/project-root-state.json"
}

stop_existing_runtime() {
	touch "$ROOT/stop-supervisor"
	stop_launchd_service 2>/dev/null || true
	local supervisors="$(find_owned_supervisor_pids | tr '\n' ' ')"
	local transients="$(find_legacy_transient_supervisor_pids | tr '\n' ' ')"
	local agents="$(find_owned_agent_pids | tr '\n' ' ')"
	local vessels="$(find_owned_connection_vessel_pids | tr '\n' ' ')"
	local legacy="$(find_legacy_runtime_pids | tr '\n' ' ')"
	[ -n "$supervisors" ] && stop_pid_set supervisor owned_supervisor_process_matches $supervisors
	[ -n "$transients" ] && \
		stop_pid_set "legacy transient supervisor" legacy_transient_supervisor_process_matches $transients
	[ -n "$agents" ] && stop_pid_set agent owned_agent_process_matches $agents
	[ -n "$vessels" ] && stop_pid_set "connection vessel" owned_connection_vessel_process_matches $vessels
	[ -n "$legacy" ] && stop_pid_set "legacy tunnel" legacy_process_matches $legacy
	if [ "$(owned_runtime_process_count)" -ne 0 ]; then
		install_fail "process" "Owned tunnel processes survived reconciliation." \
			"family=$(runtime_family_prefix) count=$(owned_runtime_process_count)"
	fi
	retire_canonical_supervisor_guard
	clear_runtime_coordination_state
}
