#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The legacy bridge is a final emergency road, never a competing permanent
# tunnel. The Awtsmoos renews modern recovery first; Awtsmoos.com isolates the
# legacy HOME and periodically returns to verified modern archives.

prepare_legacy_supervisor_home() {
	local home="$RECOVERY_ROOT/legacy-home"
	mkdir -p "$home/.awtsmoos-tunnel"
	cp -p "$ROOT/config.json" "$home/.awtsmoos-tunnel/config.json"
	printf '%s\n' "$home"
}

start_legacy_bridge() {
	local client="$RECOVERY_ROOT/bin/awtsmoos-legacy-tunnel-client.js"
	local timeout_seconds="${AWTSMOOS_LEGACY_TIMEOUT_SECONDS:-30}"
	local elapsed=0
	local legacy_home
	[ -f "$client" ] || return 1
	[ -f "$ROOT/config.json" ] || return 1
	legacy_home="$(prepare_legacy_supervisor_home)"
	: > "$ROOT/legacy-agent.log"
	HOME="$legacy_home" node "$client" >> "$ROOT/legacy-agent.log" 2>&1 &
	CHILD_PID=$!
	CHILD_OWNED=1
	CHILD_KIND="legacy"
	printf '%s\n' "$CHILD_PID" > "$PID_FILE"
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		supervisor_alive "$CHILD_PID" || return 1
		if grep -q 'Awtsmoos tunnel connected\.' "$ROOT/legacy-agent.log" 2>/dev/null; then
			supervisor_log "legacy_registered" "pid=$CHILD_PID"
			return 0
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
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
	return 1
}
