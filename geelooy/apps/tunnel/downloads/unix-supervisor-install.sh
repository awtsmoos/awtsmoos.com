#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews Node discovery, guardian modules, singleton, and receipts as one
# installed covenant. Awtsmoos.com copies every required helper together so launchd,
# portable fallback, and rollback never depend on the user's interactive shell PATH.

write_supervisor_to() {
	local destination="$1"
	mkdir -p "$destination"
	for pair in \
		"unix-node-runtime.sh:awtsmoos-node-runtime.sh" \
		"unix-legacy-catalog.sh:awtsmoos-legacy-catalog.sh" \
		"unix-supervisor.sh:awtsmoos-supervisor.sh" \
		"unix-supervisor-runtime.sh:awtsmoos-supervisor-runtime.sh" \
		"unix-supervisor-agents.sh:awtsmoos-supervisor-agents.sh" \
		"unix-supervisor-guard.sh:awtsmoos-supervisor-guard.sh" \
		"unix-supervisor-health-memory.sh:awtsmoos-supervisor-health-memory.sh" \
		"unix-supervisor-receipt.sh:awtsmoos-supervisor-receipt.sh" \
		"unix-supervisor-health.sh:awtsmoos-supervisor-health.sh" \
		"unix-supervisor-recovery.sh:awtsmoos-supervisor-recovery.sh" \
		"unix-supervisor-legacy.sh:awtsmoos-supervisor-legacy.sh" \
		"unix-agent-singleton.cjs:awtsmoos-agent-singleton.cjs" \
		"unix-agent-receipt.cjs:awtsmoos-agent-receipt.cjs" \
		"unix-agent-launcher.cjs:awtsmoos-agent-launcher.cjs"; do
		local source_name="${pair%%:*}"
		local target_name="${pair##*:}"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" "$destination/$target_name"
		chmod +x "$destination/$target_name"
	done
}

write_supervisor() {
	write_supervisor_to "$ROOT"
	persist_node_runtime "$ROOT"
}

start_supervisor() {
	local recorded=""
	write_supervisor
	rm -f "$ROOT/stop-supervisor"
	recorded="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	if command_contains "$recorded" "$ROOT/awtsmoos-supervisor.sh"; then
		return 0
	fi
	clear_connection_receipt
	if start_launchd_supervisor; then
		return 0
	fi
	AWTSMOOS_NODE_BIN="$AWTSMOOS_NODE_BIN" \
		nohup "$ROOT/awtsmoos-supervisor.sh" "$ROOT" \
		>> "$ROOT/supervisor-stdout.log" 2>&1 </dev/null &
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
			[ "$stable" -ge "$stable_samples" ] && return 0
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
