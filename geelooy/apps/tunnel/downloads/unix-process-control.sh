#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# Supervisor installation and stability waiting remain small public operations;
# lower process discovery and termination live in unix-process-runtime.sh.
write_supervisor_to() {
	local destination="$1"
	cp -p "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor.sh" \
		"$destination/awtsmoos-supervisor.sh"
	cp -p "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor-runtime.sh" \
		"$destination/awtsmoos-supervisor-runtime.sh"
	chmod +x \
		"$destination/awtsmoos-supervisor.sh" \
		"$destination/awtsmoos-supervisor-runtime.sh"
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

	nohup "$ROOT/awtsmoos-supervisor.sh" "$ROOT" \
		>> "$ROOT/supervisor-stdout.log" 2>&1 </dev/null &
}

wait_for_runtime() {
	local timeout_seconds="${1:-15}"
	local stable_seconds=0
	local elapsed=0
	local agent_pid

	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
		if command_contains "$agent_pid" "$ROOT/main.js"; then
			stable_seconds=$(( stable_seconds + 1 ))
			[ "$stable_seconds" -ge 8 ] && return 0
		else
			stable_seconds=0
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done

	return 1
}
