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
	# B"H — Yaakov 2026-10-14: Install the fixed binaryApi.js to the agent's
	# tools directory. Downloads directly — fully self-contained, no manual steps.
	local binaryApi_dst="$ROOT/tools/fs/actionGroups/missionVisibility/binaryApi.js"
	mkdir -p "$(dirname "$binaryApi_dst")"
	# B"H — Yaakov 2026-10-14: installer must be self-contained. No external
	# temporary URLs. The agent.zip already contains the fixed binaryApi.js.
	# If the tarball has the file, use it. Otherwise, skip (agent.zip has it).
	local binaryApi_src="$AWTSMOOS_INSTALL_RUNTIME/unix-binaryApi-fixed.cjs"
	if [ -f "$binaryApi_src" ]; then
		cp -p "$binaryApi_src" "$binaryApi_dst"
	fi
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
	# B"H — Yaakov 2026-10-14: Magical completion celebration.
	printf '\n' >&2
	printf '  ✨ ⋆ ✧  🎉  ✧ ⋆ ✨\n' >&2
	printf '  Your Awtsmoos Tunnel is ready!\n' >&2
	printf '  The magic is alive. ✨\n' >&2
	printf '\n' >&2
	printf '╔══════════════════════════════════════════════════════════╗\n' >&2
	printf '║  ✓ Tunnel supervisor started                              ║\n' >&2
	printf '║  Monitoring agent status (Ctrl+C to stop monitor)...       ║\n' >&2
	printf '╚══════════════════════════════════════════════════════════╝\n' >&2
	printf '\n' >&2

	local last_status=""
	while true; do
		local status_line=""
		local has_error=0

		# Check supervisor
		if [ -f "$ROOT/supervisor.pid" ]; then
			local spid=$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)
			if [ -n "$spid" ] && kill -0 "$spid" 2>/dev/null; then
				status_line="✓ Supervisor running (PID $spid)"
			else
				status_line="✗ Supervisor died (was PID $spid)"
				has_error=1
			fi
		else
			status_line="○ Supervisor PID file not found"
		fi

		# Check agent
		if pgrep -f "awtsmoos-agent" >/dev/null 2>&1; then
			local apid=$(pgrep -f "awtsmoos-agent" | head -1)
			status_line="$status_line  ✓ Agent running (PID $apid)"
		else
			status_line="$status_line  ○ Agent not running"
		fi

		# Only print if status changed
		if [ "$status_line" != "$last_status" ]; then
			printf '%s\n' "$status_line" >&2
			last_status="$status_line"
		fi

		if [ $has_error -eq 1 ]; then
			printf '\nError: supervisor died. Check logs:\n' >&2
			printf '  %s/logs/\n' "$ROOT" >&2
			if [ -d "$ROOT/logs" ]; then
				local latest=$(ls -t "$ROOT/logs" 2>/dev/null | head -1)
				if [ -n "$latest" ]; then
					printf '\nLast log lines:\n' >&2
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
