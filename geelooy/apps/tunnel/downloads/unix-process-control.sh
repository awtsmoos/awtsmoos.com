#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The supervisor is installed as one modular vessel. The Awtsmoos renews
# guardian, health memory, and legacy catalog together; Awtsmoos.com never
# restores a supervisor that cannot recognize its own historical fallbacks.

write_supervisor_to() {
	local destination="$1"
	mkdir -p "$destination"
	for pair in \
		"unix-legacy-catalog.sh:awtsmoos-legacy-catalog.sh" \
		"unix-supervisor.sh:awtsmoos-supervisor.sh" \
		"unix-supervisor-runtime.sh:awtsmoos-supervisor-runtime.sh" \
		"unix-supervisor-health-memory.sh:awtsmoos-supervisor-health-memory.sh" \
		"unix-supervisor-health.sh:awtsmoos-supervisor-health.sh" \
		"unix-supervisor-recovery.sh:awtsmoos-supervisor-recovery.sh" \
		"unix-supervisor-legacy.sh:awtsmoos-supervisor-legacy.sh" \
		"unix-agent-launcher.cjs:awtsmoos-agent-launcher.cjs"; do
		local source_name="${pair%%:*}"
		local target_name="${pair##*:}"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" \
			"$destination/$target_name"
		chmod +x "$destination/$target_name"
	done
}

write_supervisor() {
	write_supervisor_to "$ROOT"
}

start_supervisor() {
	local recorded
	write_supervisor
	rm -f "$ROOT/stop-supervisor"
	recorded="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	if command_contains "$recorded" "$ROOT/awtsmoos-supervisor.sh"; then
		return 0
	fi
	clear_connection_receipt
	nohup "$ROOT/awtsmoos-supervisor.sh" "$ROOT" \
		>> "$ROOT/supervisor-stdout.log" 2>&1 </dev/null &
}

wait_for_runtime() {
	local timeout_seconds="${1:-45}"
	local stable_seconds="${AWTSMOOS_STABILITY_SECONDS:-4}"
	local elapsed=0
	local stable=0
	local agent_pid=""
	local stable_pid=""
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
		if runtime_pid_matches "$agent_pid" && \
			runtime_registered "$agent_pid" 600000; then
			if [ "$stable_pid" = "$agent_pid" ]; then
				stable=$(( stable + 1 ))
			else
				stable_pid="$agent_pid"
				stable=1
			fi
			if [ "$stable" -ge "$stable_seconds" ]; then
				return 0
			fi
		else
			stable=0
			stable_pid=""
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	install_event "startup" "failed" \
		"Agent did not sustain a matching TUNNEL_ACK before the deadline." \
		"state=$(connection_state_name) pid=${agent_pid:-missing} stableSeconds=$stable"
	return 1
}
