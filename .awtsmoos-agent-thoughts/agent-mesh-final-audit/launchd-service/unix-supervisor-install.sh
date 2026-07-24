#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Candidate start installs its matching guardian. Restored runtimes start their own
# preserved guardian so rollback never mutates the predecessor before verification.
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

start_detached_portable_supervisor() {
	AWTSMOOS_NODE_BIN="$AWTSMOOS_NODE_BIN" node - "$ROOT" <<'NODE'
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(process.argv[2]);
const log = fs.openSync(path.join(root, "supervisor-stdout.log"), "a", 0o600);
try {
	const child = spawn("/bin/bash", [path.join(root, "awtsmoos-supervisor.sh"), root], {
		cwd: root,
		detached: true,
		env: process.env,
		stdio: ["ignore", log, log]
	});
	child.unref();
} finally {
	fs.closeSync(log);
}
NODE
}

start_supervisor_process() {
	local recorded="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	rm -f "$ROOT/stop-supervisor"
	command_contains "$recorded" "$ROOT/awtsmoos-supervisor.sh" && return 0
	clear_connection_receipt
	clear_project_root_receipt 2>/dev/null || true
	export AWTSMOOS_RUNTIME_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	start_launchd_supervisor && return 0
	start_detached_portable_supervisor
}

start_supervisor() {
	write_supervisor
	start_supervisor_process
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
