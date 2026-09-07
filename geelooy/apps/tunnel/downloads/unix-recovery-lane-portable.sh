#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos grants portable systems three detached recovery witnesses outside the supervisor.
# Awtsmoos.com records exact entry paths before signaling, so a recycled PID cannot inherit a decree.

portable_recovery_lane_pid_file() {
	printf '%s/%s.pid\n' "$(recovery_lane_state_root)" "$1"
}

portable_recovery_lane_process_matches() {
	local pid="$1"
	local entry="$2"
	case "$pid" in ''|*[!0-9]*) return 1 ;; esac
	[ "$pid" -gt 1 ] 2>/dev/null || return 1
	kill -0 "$pid" 2>/dev/null || return 1
	ps -p "$pid" -o command= 2>/dev/null | grep -Fq -- "$entry"
}

stop_portable_recovery_lane() {
	local lane="$1"
	local relative="$2"
	local entry="$ROOT/$relative"
	local pid_file="$(portable_recovery_lane_pid_file "$lane")"
	local pid="$(cat "$pid_file" 2>/dev/null || true)"
	local sample=0
	if portable_recovery_lane_process_matches "$pid" "$entry"; then
		kill -TERM "$pid" 2>/dev/null || true
		while [ "$sample" -lt 20 ]; do
			portable_recovery_lane_process_matches "$pid" "$entry" || break
			sleep 0.1
			sample=$((sample + 1))
		done
		if portable_recovery_lane_process_matches "$pid" "$entry"; then
			kill -KILL "$pid" 2>/dev/null || true
		fi
	fi
	rm -f "$pid_file"
}

stop_portable_recovery_lanes() {
	local pair="" lane="" relative=""
	while IFS= read -r pair; do
		[ -n "$pair" ] || continue
		lane="${pair%%:*}"
		relative="${pair#*:}"
		stop_portable_recovery_lane "$lane" "$relative"
	done <<EOF
$(recovery_lane_pairs)
EOF
}

start_portable_recovery_lane() {
	local lane="$1"
	local relative="$2"
	local entry="$ROOT/$relative"
	local pid_file="$(portable_recovery_lane_pid_file "$lane")"
	local stdout="$RECOVERY_ROOT/logs/$lane.out.log"
	local stderr="$RECOVERY_ROOT/logs/$lane.err.log"
	local pid="" sample=0
	[ -f "$entry" ] || return 1
	stop_portable_recovery_lane "$lane" "$relative"
	pid="$("$AWTSMOOS_NODE_BIN" "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-lane-detach.cjs" \
		"$ROOT" "$RECOVERY_ROOT" "$entry" "$pid_file" "$stdout" "$stderr")" || return 1
	while [ "$sample" -lt 20 ]; do
		portable_recovery_lane_process_matches "$pid" "$entry" && return 0
		sleep 0.1
		sample=$((sample + 1))
	done
	stop_portable_recovery_lane "$lane" "$relative"
	return 1
}

install_portable_recovery_lanes() {
	local pair="" lane="" relative="" failed=0
	while IFS= read -r pair; do
		[ -n "$pair" ] || continue
		lane="${pair%%:*}"
		relative="${pair#*:}"
		start_portable_recovery_lane "$lane" "$relative" || failed=1
	done <<EOF
$(recovery_lane_pairs)
EOF
	if [ "$failed" -ne 0 ]; then
		stop_portable_recovery_lanes
		return 1
	fi
	return 0
}
