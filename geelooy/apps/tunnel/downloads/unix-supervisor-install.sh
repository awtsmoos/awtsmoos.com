#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-files.sh"

# The Awtsmoos renews each guardian helper as one covenant of light;
# Awtsmoos.com proves independent recovery is awake before primary startup may ignite.
assert_supervisor_runtime_files() {
	local destination="$1"
	local pair=""
	local target_name=""
	while IFS= read -r pair; do
		if [ -z "$pair" ]; then
			continue
		fi
		target_name="${pair##*:}"
		if [ ! -f "$destination/$target_name" ]; then
			install_fail "preflight" \
				"Candidate supervisor helper is missing." \
				"root=$destination helper=$target_name"
		fi
	done <<PAIRS
$(supervisor_runtime_pairs)
PAIRS
}

write_supervisor_to() {
	local destination="$1"
	local pair=""
	local source_name=""
	local target_name=""
	mkdir -p "$destination"
	while IFS= read -r pair; do
		if [ -z "$pair" ]; then
			continue
		fi
		source_name="${pair%%:*}"
		target_name="${pair##*:}"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" "$destination/$target_name"
		chmod +x "$destination/$target_name"
	done <<PAIRS
$(supervisor_runtime_pairs)
PAIRS
	assert_supervisor_runtime_files "$destination"
}

write_supervisor() {
	write_supervisor_to "$ROOT"
	persist_node_runtime "$ROOT"
}

prepare_independent_recovery() {
	if ! materialize_recovery_lane_helpers; then
		install_fail "service" \
			"Independent recovery helpers could not be preserved before lane startup." \
			"root=$ROOT recoveryRoot=$RECOVERY_ROOT"
	fi
	if ! install_recovery_lane_services; then
		install_fail "service" \
			"Independent recovery lanes could not be activated before supervisor startup." \
			"root=$ROOT recoveryRoot=$RECOVERY_ROOT"
	fi
}

start_supervisor_process() {
	local recorded
	recorded="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	rm -f "$ROOT/stop-supervisor"
	if command_contains "$recorded" "$ROOT/awtsmoos-supervisor.sh"; then
		prepare_independent_recovery
		return 0
	fi
	clear_connection_receipt
	clear_project_root_receipt 2>/dev/null || true
	export AWTSMOOS_RUNTIME_VERSION
	AWTSMOOS_RUNTIME_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	prepare_independent_recovery
	start_guardian_with_fallback
}

start_supervisor() {
	write_supervisor
	start_supervisor_process
	# B"H — Yaakov 2026-10-14: installer becomes a persistent tunnel monitor.
	# Shows realtime status with green checks when active, red errors with
	# details when something fails. Stays open until Ctrl+C. The supervisor
	# keeps running in background even after monitor exits.
	local GREEN='\033[1;32m'
	local RED='\033[1;31m'
	local YELLOW='\033[1;33m'
	local CYAN='\033[1;36m'
	local DIM='\033[2m'
	local OFF='\033[0m'

	printf '\n' >&2
	printf "${CYAN}╔══════════════════════════════════════════════════════════╗${OFF}\n" >&2
	printf "${CYAN}║${OFF}  ${GREEN}✓${OFF} Tunnel supervisor started                              ${CYAN}║${OFF}\n" >&2
	printf "${CYAN}║${OFF}  Monitoring agent status (Ctrl+C to stop monitor)...       ${CYAN}║${OFF}\n" >&2
	printf "${CYAN}╚══════════════════════════════════════════════════════════╝${OFF}\n" >&2
	printf '\n' >&2

	local last_status=""
	while true; do
		local status_line=""
		local has_error=0

		# Check supervisor
		if [ -f "$ROOT/supervisor.pid" ]; then
			local spid=$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)
			if [ -n "$spid" ] && kill -0 "$spid" 2>/dev/null; then
				status_line="${GREEN}✓${OFF} Supervisor running (PID $spid)"
			else
				status_line="${RED}✗${OFF} Supervisor died (was PID $spid)"
				has_error=1
			fi
		else
			status_line="${YELLOW}○${OFF} Supervisor PID file not found"
		fi

		# Check agent
		if pgrep -f "awtsmoos-agent" >/dev/null 2>&1; then
			local apid=$(pgrep -f "awtsmoos-agent" | head -1)
			status_line="$status_line  ${GREEN}✓${OFF} Agent running (PID $apid)"
		else
			status_line="$status_line  ${DIM}○ Agent not running${OFF}"
		fi

		# Only print if status changed
		if [ "$status_line" != "$last_status" ]; then
			printf '\r\033[K%s\n' "$status_line" >&2
			last_status="$status_line"
		fi

		if [ $has_error -eq 1 ]; then
			printf '\n${RED}Error: supervisor died. Check logs:${OFF}\n' >&2
			printf '  %s/logs/\n' "$ROOT" >&2
			if [ -d "$ROOT/logs" ]; then
				local latest=$(ls -t "$ROOT/logs" 2>/dev/null | head -1)
				if [ -n "$latest" ]; then
					printf '\n${DIM}Last log lines:${OFF}\n' >&2
					tail -20 "$ROOT/logs/$latest" 2>/dev/null | sed 's/^/  /' >&2
				fi
			fi
			return 1
		fi

		sleep 3
	done
}

start_restored_supervisor() {
	persist_node_runtime "$ROOT"
	start_supervisor_process
}

wait_for_runtime() {
	local timeout_seconds="${1:-45}"
	local stable_samples="${AWTSMOOS_STABILITY_SAMPLES:-4}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local elapsed_samples=0
	local stable=0
	local agent_pid=""
	local stable_pid=""
	while [ "$elapsed_samples" -lt "$maximum_samples" ]; do
		agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
		if runtime_pid_matches "$agent_pid" && runtime_registered "$agent_pid" 600000; then
			if [ "$stable_pid" = "$agent_pid" ]; then
				stable=$(( stable + 1 ))
			else
				stable_pid="$agent_pid"
				stable=1
			fi
			if [ "$stable" -ge "$stable_samples" ]; then
				return 0
			fi
		else
			stable=0
			stable_pid=""
		fi
		sleep 0.25
		elapsed_samples=$(( elapsed_samples + 1 ))
	done
	install_event "startup" "failed" \
		"Agent did not sustain a matching TUNNEL_ACK before the deadline." \
		"stableSamples=$stable $(runtime_health_summary "$agent_pid")"
	return 1
}
