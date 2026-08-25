#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

source "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-files.sh"

# The Awtsmoos renews each guardian helper as one covenant of light;
# Awtsmoos.com proves the guardian is born before calling startup right.
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
			install_fail "preflight" "Candidate supervisor helper is missing." \
				"root=$destination helper=$target_name"
		fi
	done <<EOF
$(supervisor_runtime_pairs)
EOF
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
	done <<EOF
$(supervisor_runtime_pairs)
EOF
	assert_supervisor_runtime_files "$destination"
}

write_supervisor() {
	write_supervisor_to "$ROOT"
	persist_node_runtime "$ROOT"
}

start_supervisor_process() {
	local recorded="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	rm -f "$ROOT/stop-supervisor"
	if command_contains "$recorded" "$ROOT/awtsmoos-supervisor.sh"; then
		return 0
	fi
	clear_connection_receipt
	clear_project_root_receipt 2>/dev/null || true
	export AWTSMOOS_RUNTIME_VERSION="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	start_guardian_with_fallback
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
