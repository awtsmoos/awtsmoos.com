#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos recognizes every owned runtime garment beneath the canonical family.
# Awtsmoos.com separates live-root witnesses from displaced, rollback, failed,
# candidate, and recovery processes that must all die before activation.
is_alive() {
	[ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}
process_command() {
	ps -p "$1" -o command= 2>/dev/null || true
}
command_matches_script() {
	local command="$1" executable_name="$2" expected_script="$3"
	local executable="" script="" remainder=""
	read -r executable script remainder <<< "$command"
	[ "${executable##*/}" = "$executable_name" ] && [ "$script" = "$expected_script" ]
}
runtime_family_prefix() {
	printf '%s/%s\n' "$(dirname "$ROOT")" "$(basename "$ROOT")"
}
command_matches_runtime_family() {
	local command="$1" executable_name="$2" script_suffix="$3"
	local executable="" script="" remainder="" prefix="$(runtime_family_prefix)"
	read -r executable script remainder <<< "$command"
	[ "${executable##*/}" = "$executable_name" ] || return 1
	case "$script" in
		"$prefix"/"$script_suffix"|"$prefix"*/"$script_suffix") return 0 ;;
		*) return 1 ;;
	esac
}
agent_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" "node" "$ROOT/main.js" ||
		command_matches_script "$command" "node" "$ROOT/awtsmoos-agent-launcher.cjs"
}
owned_agent_process_matches() {
	local command="$(process_command "$1")"
	command_matches_runtime_family "$command" "node" "main.js" ||
		command_matches_runtime_family "$command" "node" "awtsmoos-agent-launcher.cjs"
}
connection_vessel_process_matches() {
	command_matches_script \
		"$(process_command "$1")" "node" "$ROOT/lib/connection-vessel/child.js"
}
owned_connection_vessel_process_matches() {
	command_matches_runtime_family \
		"$(process_command "$1")" "node" "lib/connection-vessel/child.js"
}
supervisor_process_matches() {
	local command="$(process_command "$1")"
	command_matches_script "$command" "bash" "$ROOT/awtsmoos-supervisor.sh" ||
		command_matches_script "$command" "sh" "$ROOT/awtsmoos-supervisor.sh"
}
owned_supervisor_process_matches() {
	local command="$(process_command "$1")"
	command_matches_runtime_family "$command" "bash" "awtsmoos-supervisor.sh" ||
		command_matches_runtime_family "$command" "sh" "awtsmoos-supervisor.sh"
}
process_table() {
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true
}
find_candidate_pids() {
	local needle="$1"
	process_table | awk -v self="$$" -v needle="$needle" '
		$1 != self && index($0, needle) > 0 { print $1 }
	'
}
filter_matching_pids() {
	local matcher="$1" pid=""
	while IFS= read -r pid; do
		"$matcher" "$pid" && printf '%s\n' "$pid"
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
		sort -n -u | filter_matching_pids supervisor_process_matches
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
		sort -n -u | filter_matching_pids owned_supervisor_process_matches
}
process_count() {
	sort -n -u | awk 'NF { count += 1 } END { print count + 0 }'
}
exact_root_process_count() {
	{ find_agent_pids; find_connection_vessel_pids; find_supervisor_pids; } | process_count
}
owned_runtime_process_count() {
	{ find_owned_agent_pids; find_owned_connection_vessel_pids; find_owned_supervisor_pids; } |
		process_count
}
