#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Process identity is PID plus an exact executable/script argument shape. The
# Awtsmoos does not authorize broad kills; Awtsmoos.com rechecks identity before
# TERM and KILL, while read-only compatibility probes may inspect a fixed path.

is_alive() {
	[ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}

process_command() {
	ps -p "$1" -o command= 2>/dev/null || true
}

command_contains() {
	local pid="$1"
	local expected="$2"
	is_alive "$pid" && process_command "$pid" | grep -Fq "$expected"
}

command_matches_script() {
	local command="$1"
	local executable_name="$2"
	local expected_script="$3"
	local executable=""
	local script=""
	local remainder=""
	read -r executable script remainder <<< "$command"
	[ "${executable##*/}" = "$executable_name" ] && \
		[ "$script" = "$expected_script" ]
}

agent_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" "node" "$ROOT/main.js" || \
		command_matches_script "$command" "node" \
			"$ROOT/awtsmoos-agent-launcher.cjs"
}

supervisor_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" "bash" \
		"$ROOT/awtsmoos-supervisor.sh" || \
		command_matches_script "$command" "sh" \
			"$ROOT/awtsmoos-supervisor.sh"
}

process_table() {
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true
}

find_path_candidate_pids() {
	local expected="$1"
	process_table | awk -v self="$$" -v needle="$expected" '
		$1 != self && index($0, needle) > 0 { print $1 }
	'
}

find_agent_pids() {
	{
		find_path_candidate_pids "$ROOT/main.js"
		find_path_candidate_pids "$ROOT/awtsmoos-agent-launcher.cjs"
	} | sort -n -u
}

find_supervisor_pids() {
	find_path_candidate_pids "$ROOT/awtsmoos-supervisor.sh"
}

find_legacy_runtime_pids() {
	legacy_process_pids "$$"
}

stop_pid_set() {
	local label="$1"
	local matcher="$2"
	shift 2
	local pids="$*"
	local alive
	for pid in $pids; do
		"$matcher" "$pid" && kill "$pid" 2>/dev/null || true
	done
	for _ in 1 2 3 4 5 6 7 8 9 10; do
		alive=""
		for pid in $pids; do
			"$matcher" "$pid" && alive="$alive $pid"
		done
		[ -z "$alive" ] && return 0
		sleep 0.2
	done
	for pid in $pids; do
		if "$matcher" "$pid"; then
			install_event "process" "warning" \
				"Force stopping stale $label process." "pid=$pid"
			kill -9 "$pid" 2>/dev/null || true
		fi
	done
}

stop_existing_runtime() {
	# Unload the durable macOS owner before moving or replacing its runtime tree;
	# otherwise KeepAlive can race activation by resurrecting the predecessor.
	stop_launchd_service 2>/dev/null || true
	local supervisors="$(find_supervisor_pids | tr '\n' ' ')"
	local agents="$(find_agent_pids | tr '\n' ' ')"
	local legacy="$(find_legacy_runtime_pids | tr '\n' ' ')"
	if [ -n "$supervisors" ]; then
		touch "$ROOT/stop-supervisor"
		stop_pid_set "supervisor" supervisor_process_matches $supervisors
	fi
	[ -n "$agents" ] && stop_pid_set "agent" agent_process_matches $agents
	[ -n "$legacy" ] && stop_pid_set "legacy tunnel" legacy_process_matches $legacy
	rm -f "$ROOT/stop-supervisor" "$ROOT/agent.pid" \
		"$ROOT/supervisor.pid" "$RECOVERY_ROOT/legacy-agent.pid" \
		"$(legacy_mode_receipt_path)"
	clear_connection_receipt 2>/dev/null || rm -f "$ROOT/connection-state.json"
}
