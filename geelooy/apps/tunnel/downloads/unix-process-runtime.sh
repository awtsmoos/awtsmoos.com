#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Process identity is measured by PID and command path. The Awtsmoos does not
# permit stale receipts or broad process names to authorize an unrelated kill.

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

process_table() {
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true
}

find_agent_pids() {
	local launcher="$ROOT/awtsmoos-agent-launcher.cjs"
	process_table | awk -v self="$$" -v main="$ROOT/main.js" -v launcher="$launcher" '
		$1 != self && index($0, "node") > 0 &&
		(index($0, main) > 0 || index($0, launcher) > 0) { print $1 }
	'
}

find_supervisor_pids() {
	process_table | awk -v self="$$" -v needle="$ROOT/awtsmoos-supervisor.sh" '
		$1 != self && index($0, needle) > 0 { print $1 }
	'
}

find_legacy_runtime_pids() {
	local needle="$RECOVERY_ROOT/bin/awtsmoos-legacy-tunnel-client.js"
	process_table | awk -v self="$$" -v needle="$needle" '
		$1 != self && index($0, needle) > 0 && index($0, "node") > 0 { print $1 }
	'
}

stop_pid_set() {
	local label="$1"
	shift
	local pids="$*"
	local alive
	for pid in $pids; do
		kill "$pid" 2>/dev/null || true
	done
	for _ in 1 2 3 4 5 6 7 8 9 10; do
		alive=""
		for pid in $pids; do
			is_alive "$pid" && alive="$alive $pid"
		done
		[ -z "$alive" ] && return 0
		sleep 0.2
	done
	for pid in $pids; do
		if is_alive "$pid"; then
			install_event "process" "warning" \
				"Force stopping stale $label process." "pid=$pid"
			kill -9 "$pid" 2>/dev/null || true
		fi
	done
}

stop_existing_runtime() {
	local supervisor_pids
	local agent_pids
	local legacy_pids
	supervisor_pids="$(find_supervisor_pids | tr '\n' ' ')"
	agent_pids="$(find_agent_pids | tr '\n' ' ')"
	legacy_pids="$(find_legacy_runtime_pids | tr '\n' ' ')"
	if [ -n "$supervisor_pids" ]; then
		touch "$ROOT/stop-supervisor"
		stop_pid_set "supervisor" $supervisor_pids
	fi
	[ -n "$agent_pids" ] && stop_pid_set "agent" $agent_pids
	[ -n "$legacy_pids" ] && stop_pid_set "legacy tunnel" $legacy_pids
	rm -f \
		"$ROOT/stop-supervisor" \
		"$ROOT/agent.pid" \
		"$ROOT/supervisor.pid" \
		"$RECOVERY_ROOT/legacy-agent.pid"
	clear_connection_receipt 2>/dev/null || rm -f "$ROOT/connection-state.json"
}
