#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The legacy bridge is the final emergency candle, never a competing permanent
# process. The Awtsmoos renews the modern vessel first; Awtsmoos.com lights this
# bridge only after verified modern versions have failed registration.

legacy_client_path() {
	printf '%s\n' "$RECOVERY_ROOT/bin/awtsmoos-legacy-tunnel-client.js"
}

legacy_pid_file() {
	printf '%s\n' "$RECOVERY_ROOT/legacy-agent.pid"
}

legacy_home_path() {
	printf '%s\n' "$RECOVERY_ROOT/legacy-home"
}

prepare_legacy_home() {
	local legacy_home
	legacy_home="$(legacy_home_path)"
	mkdir -p "$legacy_home/.awtsmoos-tunnel"
	cp -p "$ROOT/config.json" "$legacy_home/.awtsmoos-tunnel/config.json"
}

find_legacy_pids() {
	local client
	client="$(legacy_client_path)"
	process_table | awk -v self="$$" -v needle="$client" '
		$1 != self && index($0, "node " needle) > 0 { print $1 }
	'
}

stop_legacy_fallback() {
	local pids
	pids="$(find_legacy_pids | tr '\n' ' ')"
	[ -n "$pids" ] && stop_pid_set "legacy tunnel" $pids
	rm -f "$(legacy_pid_file)"
}

start_legacy_fallback() {
	local client
	local pid_file
	local log_file="$ROOT/legacy-agent.log"
	local timeout_seconds="${AWTSMOOS_LEGACY_TIMEOUT_SECONDS:-30}"
	local elapsed=0
	client="$(legacy_client_path)"
	pid_file="$(legacy_pid_file)"
	[ -f "$client" ] || return 1
	[ -f "$ROOT/config.json" ] || return 1
	stop_legacy_fallback
	prepare_legacy_home
	: > "$log_file"
	HOME="$(legacy_home_path)" nohup node "$client" \
		>> "$log_file" 2>&1 </dev/null &
	local pid=$!
	printf '%s\n' "$pid" > "$pid_file"
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		command_contains "$pid" "$client" || return 1
		if grep -q 'Awtsmoos tunnel connected\.' "$log_file" 2>/dev/null; then
			install_event "legacy" "passed" \
				"Emergency legacy bridge registered." "pid=$pid"
			return 0
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	stop_legacy_fallback
	install_event "legacy" "failed" \
		"Emergency legacy bridge did not register." "$log_file"
	return 1
}
