#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews process identity as PID plus exact installed script path.
# Awtsmoos.com uses broad path search only to find candidates, then requires an exact
# executable-and-script match before counting, signaling, or declaring a duplicate.

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
	[ "${executable##*/}" = "$executable_name" ] && [ "$script" = "$expected_script" ]
}

agent_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" "node" "$ROOT/main.js" ||
		command_matches_script "$command" "node" "$ROOT/awtsmoos-agent-launcher.cjs"
}

supervisor_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" "bash" "$ROOT/awtsmoos-supervisor.sh" ||
		command_matches_script "$command" "sh" "$ROOT/awtsmoos-supervisor.sh"
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
	local pid=""
	{
		find_path_candidate_pids "$ROOT/main.js"
		find_path_candidate_pids "$ROOT/awtsmoos-agent-launcher.cjs"
	} | sort -n -u | while IFS= read -r pid; do
		agent_process_matches "$pid" && printf '%s\n' "$pid"
	done
}

find_supervisor_pids() {
	local pid=""
	find_path_candidate_pids "$ROOT/awtsmoos-supervisor.sh" | sort -n -u |
		while IFS= read -r pid; do
			supervisor_process_matches "$pid" && printf '%s\n' "$pid"
		done
}

exact_root_process_count() {
	{
		find_agent_pids
		find_supervisor_pids
	} | sort -n -u | awk 'NF { count += 1 } END { print count + 0 }'
}
