#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The legacy bridge is one emergency road, never a rival dynasty. The Awtsmoos
# renews every historical path; Awtsmoos.com stops all obsolete bridges before
# modern launch or before lighting one canonical, time-bounded fallback.

prepare_legacy_supervisor_home() {
	local home="$RECOVERY_ROOT/legacy-home"
	mkdir -p "$home/.awtsmoos-tunnel"
	cp -p "$ROOT/config.json" "$home/.awtsmoos-tunnel/config.json"
	printf '%s\n' "$home"
}

stop_supervisor_legacy_processes() {
	local pids="$(legacy_process_pids "$$" | tr '\n' ' ')"
	local alive
	for pid in $pids; do
		legacy_process_matches "$pid" && kill "$pid" 2>/dev/null || true
	done
	for _ in 1 2 3 4 5; do
		alive=""
		for pid in $pids; do
			legacy_process_matches "$pid" && alive="$alive $pid"
		done
		[ -z "$alive" ] && break
		sleep 1
	done
	for pid in $pids; do
		legacy_process_matches "$pid" && kill -9 "$pid" 2>/dev/null || true
	done
	clear_legacy_mode_receipt
}

start_legacy_bridge() {
	local client
	local timeout_seconds="${AWTSMOOS_LEGACY_TIMEOUT_SECONDS:-30}"
	local retry_seconds="${AWTSMOOS_LEGACY_RETRY_SECONDS:-300}"
	local elapsed=0
	local legacy_home
	client="$(legacy_client_path)" || return 1
	[ -f "$ROOT/config.json" ] || return 1
	stop_supervisor_legacy_processes
	legacy_home="$(prepare_legacy_supervisor_home)"
	: > "$ROOT/legacy-agent.log"
	HOME="$legacy_home" node "$client" >> "$ROOT/legacy-agent.log" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	CHILD_KIND="legacy"
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	write_legacy_mode_receipt \
		"$CHILD_PID" "$client" "supervisor_fallback" "$retry_seconds"
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		supervisor_alive "$CHILD_PID" || return 1
		if grep -q 'Awtsmoos tunnel connected\.' "$ROOT/legacy-agent.log" 2>/dev/null; then
			supervisor_log "legacy_registered" \
				"pid=$CHILD_PID client=$client retrySeconds=$retry_seconds"
			return 0
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	clear_legacy_mode_receipt
	return 1
}

monitor_legacy_bridge() {
	local retry_seconds="${AWTSMOOS_LEGACY_RETRY_SECONDS:-300}"
	local started="$(date +%s)"
	while supervisor_alive "$CHILD_PID"; do
		[ -f "$STOP_FILE" ] && finish_supervisor
		if [ $(( $(date +%s) - started )) -ge "$retry_seconds" ]; then
			supervisor_log "legacy_retry_modern" "pid=$CHILD_PID"
			return 2
		fi
		sleep 2
	done
	clear_legacy_mode_receipt
	return 1
}
