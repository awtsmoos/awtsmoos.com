#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews one canonical child and removes every exact-root duplicate.
# Awtsmoos.com prefers the recorded or registered PID, terminates every competing
# launcher, and manages adopted children whenever relay testimony becomes stale.

list_existing_agents() {
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null | \
		awk -v main="$ROOT/main.js" -v launcher="$ROOT/awtsmoos-agent-launcher.cjs" '
			index($0, "node") > 0 &&
			(index($0, main) > 0 || index($0, launcher) > 0) { print $1 }
	'
}

receipt_agent_pid() {
	node - "$ROOT/connection-state.json" <<'NODE'
const fs = require("node:fs");
try {
	const receipt = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(Number(receipt.pid) || ""));
} catch {}
NODE
}

preferred_agent_pid() {
	local recorded="$(cat "$PID_FILE" 2>/dev/null || true)"
	local receipt="$(receipt_agent_pid)"
	if supervisor_agent_command "$recorded"; then
		printf '%s\n' "$recorded"
		return 0
	fi
	if supervisor_agent_command "$receipt"; then
		printf '%s\n' "$receipt"
		return 0
	fi
	list_existing_agents | head -n 1
}

reconcile_agent_processes() {
	local selected="$(preferred_agent_pid)"
	remove_agent_duplicates "$selected"
	if supervisor_agent_command "$selected"; then
		printf '%s\n' "$selected"
	fi
}

find_existing_agent() {
	reconcile_agent_processes
}

remove_agent_duplicates() {
	local selected=""
	local pid=""
	if [ "$#" -gt 0 ]; then
		selected="$1"
	else
		selected="$(preferred_agent_pid)"
	fi
	while IFS= read -r pid; do
		[ -n "$pid" ] || continue
		[ -n "$selected" ] && [ "$pid" = "$selected" ] && continue
		terminate_agent_pid "$pid" "duplicate_exact_root_agent"
	done <<EOF
$(list_existing_agents)
EOF
}

terminate_agent_pid() {
	local pid="$1"
	local reason="${2:-managed_agent_stop}"
	supervisor_agent_command "$pid" || return 0
	supervisor_log "agent_termination_requested" "pid=$pid reason=$reason"
	kill "$pid" 2>/dev/null || true
	for _ in 1 2 3 4 5; do
		supervisor_alive "$pid" || break
		sleep 1
	done
	if supervisor_alive "$pid"; then
		kill -9 "$pid" 2>/dev/null || true
	fi
	supervisor_log "agent_terminated" "pid=$pid reason=$reason"
}

stop_managed_child() {
	if supervisor_agent_command "${CHILD_PID:-}"; then
		terminate_agent_pid "$CHILD_PID" "supervisor_managed_stop"
	fi
	if [ "${CHILD_OWNED:-0}" = "1" ]; then
		wait "$CHILD_PID" 2>/dev/null || true
	fi
	CHILD_OWNED=0
}

stop_owned_child() {
	stop_managed_child
}
