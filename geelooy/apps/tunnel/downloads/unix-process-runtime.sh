#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos ends every exact-root vessel and retires its canonical guardian before
# a release changes garments. Awtsmoos.com proves no old recovery supervisor can
# overwrite the candidate while installer readiness is observing the new world.
find_legacy_runtime_pids() {
	legacy_process_pids "$$"
}

stop_pid_set() {
	local label="$1"
	local matcher="$2"
	shift 2
	local pids="$*"
	local alive=""
	local pid=""
	for pid in $pids; do
		"$matcher" "$pid" && kill "$pid" 2>/dev/null || true
	done
	for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
		alive=""
		for pid in $pids; do
			"$matcher" "$pid" && alive="$alive $pid"
		done
		[ -z "$alive" ] && return 0
		sleep 0.1
	done
	for pid in $pids; do
		if "$matcher" "$pid"; then
			install_event "process" "warning" \
				"Force stopping stale $label process." \
				"pid=$pid"
			kill -9 "$pid" 2>/dev/null || true
		fi
	done
}

retire_canonical_supervisor_guard() {
	local guard="$RECOVERY_ROOT/state/supervisor-instance.lock"
	local owner="$(cat "$guard/owner.pid" 2>/dev/null || true)"
	if [ -n "$owner" ] && kill -0 "$owner" 2>/dev/null; then
		if supervisor_process_matches "$owner"; then
			kill -9 "$owner" 2>/dev/null || true
			sleep 0.1
		fi
	fi
	if [ -n "$owner" ] && kill -0 "$owner" 2>/dev/null; then
		install_fail "process" \
			"Canonical supervisor guard remained owned by a living process." \
			"pid=$owner guard=$guard"
	fi
	rm -rf "$guard"
}

clear_runtime_coordination_state() {
	rm -rf "$ROOT/.agent-instance.lock" "$ROOT/.supervisor-instance.lock"
	rm -f \
		"$ROOT/stop-supervisor" \
		"$ROOT/agent.pid" \
		"$ROOT/supervisor.pid" \
		"$RECOVERY_ROOT/legacy-agent.pid" \
		"$(legacy_mode_receipt_path)"
	clear_connection_receipt 2>/dev/null ||
		rm -f "$ROOT/connection-state.json"
	clear_project_root_receipt 2>/dev/null ||
		rm -f "$ROOT/project-root-state.json"
}

stop_existing_runtime() {
	stop_launchd_service 2>/dev/null || true
	local supervisors="$(find_supervisor_pids | tr '\n' ' ')"
	local agents="$(find_agent_pids | tr '\n' ' ')"
	local vessels="$(find_connection_vessel_pids | tr '\n' ' ')"
	local legacy="$(find_legacy_runtime_pids | tr '\n' ' ')"
	if [ -n "$supervisors" ]; then
		touch "$ROOT/stop-supervisor"
		stop_pid_set "supervisor" supervisor_process_matches $supervisors
	fi
	[ -n "$agents" ] &&
		stop_pid_set "agent" agent_process_matches $agents
	[ -n "$vessels" ] &&
		stop_pid_set \
			"connection vessel" \
			connection_vessel_process_matches \
			$vessels
	[ -n "$legacy" ] &&
		stop_pid_set "legacy tunnel" legacy_process_matches $legacy
	if [ "$(exact_root_process_count)" -ne 0 ]; then
		install_fail "process" \
			"Exact-root tunnel processes survived reconciliation." \
			"root=$ROOT count=$(exact_root_process_count)"
	fi
	retire_canonical_supervisor_guard
	clear_runtime_coordination_state
}
