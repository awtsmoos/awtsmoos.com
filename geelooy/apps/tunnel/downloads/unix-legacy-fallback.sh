#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The legacy bridge is one canonical emergency candle. The Awtsmoos renews every
# historical filename; Awtsmoos.com extinguishes only verified legacy Node
# processes before lighting one isolated fallback with a durable mode receipt.

legacy_pid_file() {
	printf '%s\n' "$RECOVERY_ROOT/legacy-agent.pid"
}

legacy_home_path() {
	printf '%s\n' "$RECOVERY_ROOT/legacy-home"
}

prepare_legacy_home() {
	local legacy_home="$(legacy_home_path)"
	mkdir -p "$legacy_home/.awtsmoos-tunnel"
	cp -p "$ROOT/config.json" "$legacy_home/.awtsmoos-tunnel/config.json"
}

find_legacy_pids() {
	legacy_process_pids "$$"
}

stop_legacy_fallback() {
	local pids="$(find_legacy_pids | tr '\n' ' ')"
	if [ -n "$pids" ]; then
		stop_pid_set "legacy tunnel" legacy_process_matches $pids
	fi
	rm -f "$(legacy_pid_file)"
	clear_legacy_mode_receipt
}

start_legacy_fallback() {
	local client
	local log_file="$ROOT/legacy-agent.log"
	local timeout_seconds="${AWTSMOOS_LEGACY_TIMEOUT_SECONDS:-30}"
	local elapsed=0
	client="$(legacy_client_path)" || return 1
	[ -f "$ROOT/config.json" ] || return 1
	stop_legacy_fallback
	prepare_legacy_home
	: > "$log_file"
	HOME="$(legacy_home_path)" nohup node "$client" \
		>> "$log_file" 2>&1 </dev/null &
	local pid=$!
	printf '%s\n' "$pid" > "$(legacy_pid_file)"
	write_legacy_mode_receipt "$pid" "$client" "installer_fallback"
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		legacy_process_matches "$pid" || return 1
		if grep -q 'Awtsmoos tunnel connected\.' "$log_file" 2>/dev/null; then
			install_event "legacy" "passed" \
				"Emergency legacy bridge registered." "pid=$pid client=$client"
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
