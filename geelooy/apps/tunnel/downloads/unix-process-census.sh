#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos recognizes only explicit garments of one runtime family.
# Awtsmoos.com never confuses a same-prefix rescue sibling with primary ownership.
if ! command -v runtime_script_belongs_to_family >/dev/null 2>&1; then
	source "${AWTSMOOS_INSTALL_RUNTIME:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}/unix-runtime-family.sh"
fi

is_alive() {
	local pid="${1:-}" state=""
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null || return 1
	state="$(ps -p "$pid" -o state= 2>/dev/null | tr -d ' ' | cut -c1)"
	[ -n "$state" ] && [ "$state" != "Z" ]
}
process_command() { ps -p "$1" -o command= 2>/dev/null || true; }
command_contains() { is_alive "$1" && process_command "$1" | grep -Fq "$2"; }

command_matches_script() {
	local command="$1" executable_name="$2" expected_script="$3"
	local executable="" script="" remainder=""
	read -r executable script remainder <<< "$command"
	[ "${executable##*/}" = "$executable_name" ] && [ "$script" = "$expected_script" ]
}

runtime_family_prefix() { runtime_family_root; }

command_matches_runtime_family() {
	local command="$1" executable_name="$2" script_suffix="$3"
	local executable="" script="" remainder=""
	read -r executable script remainder <<< "$command"
	[ "${executable##*/}" = "$executable_name" ] || return 1
	runtime_script_belongs_to_family "$script" "$script_suffix"
}

agent_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" node "$ROOT/main.js" ||
		command_matches_script "$command" node "$ROOT/awtsmoos-agent-launcher.cjs"
}
owned_agent_process_matches() {
	local command="$(process_command "$1")"
	command_matches_runtime_family "$command" node main.js ||
		command_matches_runtime_family "$command" node awtsmoos-agent-launcher.cjs
}
connection_vessel_process_matches() {
	command_matches_script "$(process_command "$1")" node "$ROOT/lib/connection-vessel/child.js"
}
owned_connection_vessel_process_matches() {
	command_matches_runtime_family \
		"$(process_command "$1")" node "lib/connection-vessel/child.js"
}
supervisor_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" bash "$ROOT/awtsmoos-supervisor.sh" ||
		command_matches_script "$command" sh "$ROOT/awtsmoos-supervisor.sh"
}
owned_supervisor_process_matches() {
	local command="$(process_command "$1")"
	command_matches_runtime_family "$command" bash awtsmoos-supervisor.sh ||
		command_matches_runtime_family "$command" sh awtsmoos-supervisor.sh
}

process_table() { LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true; }
find_candidate_pids() {
	local needle="$1"
	process_table | awk -v self="$$" -v needle="$needle" \
		'$1 != self && index($0, needle) > 0 { print $1 }'
}
filter_matching_pids() {
	local matcher="$1" exclude_matching_parent="${2:-0}" pid="" parent=""
	while IFS= read -r pid; do
		"$matcher" "$pid" || continue
		if [ "$exclude_matching_parent" = "1" ]; then
			parent="$(ps -p "$pid" -o ppid= 2>/dev/null | tr -d ' ')"
			"$matcher" "$parent" && continue
		fi
		printf '%s\n' "$pid"
	done
}
find_agent_pids() {
	{ find_candidate_pids "$ROOT/main.js"; find_candidate_pids "$ROOT/awtsmoos-agent-launcher.cjs"; } |
		sort -n -u | filter_matching_pids agent_process_matches
}
find_connection_vessel_pids() {
	find_candidate_pids "$ROOT/lib/connection-vessel/child.js" |
		sort -n -u | filter_matching_pids connection_vessel_process_matches
}
find_supervisor_pids() {
	find_candidate_pids "$ROOT/awtsmoos-supervisor.sh" |
		sort -n -u | filter_matching_pids supervisor_process_matches 1
}
find_owned_agent_pids() {
	find_candidate_pids "$(runtime_family_prefix)" |
		sort -n -u | filter_matching_pids owned_agent_process_matches
}
find_owned_connection_vessel_pids() {
	find_candidate_pids "$(runtime_family_prefix)" |
		sort -n -u | filter_matching_pids owned_connection_vessel_process_matches
}
find_owned_supervisor_pids() {
	find_candidate_pids "$(runtime_family_prefix)" |
		sort -n -u | filter_matching_pids owned_supervisor_process_matches 1
}
process_count() { sort -n -u | awk 'NF { count += 1 } END { print count + 0 }'; }
exact_root_process_count() {
	{ find_agent_pids; find_connection_vessel_pids; find_supervisor_pids; } | process_count
}
owned_runtime_process_count() {
	{ find_owned_agent_pids; find_owned_connection_vessel_pids; find_owned_supervisor_pids; } |
		process_count
}
