#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Logs preserve testimony without consuming the vessel forever. The Awtsmoos
# renews memory with measure; Awtsmoos.com keeps recent evidence and prunes age.

rotate_log_file() {
	local file="$1"
	local max_bytes="${AWTSMOOS_LOG_MAX_BYTES:-5242880}"
	local keep="${AWTSMOOS_LOG_KEEP_COUNT:-5}"
	[ -f "$file" ] || return 0
	local bytes
	bytes="$(wc -c < "$file" 2>/dev/null || printf '0')"
	[ "$bytes" -ge "$max_bytes" ] || return 0
	local stamp
	stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	mv "$file" "${file}.${stamp}"
	: > "$file"
	prune_rotated_logs "$file" "$keep"
}

prune_rotated_logs() {
	local file="$1"
	local keep="$2"
	local count=0
	for archived in $(ls -1t "${file}."* 2>/dev/null || true); do
		count=$(( count + 1 ))
		[ "$count" -le "$keep" ] || rm -f "$archived"
	done
}

rotate_runtime_logs() {
	mkdir -p "$ROOT" "$RECOVERY_ROOT/logs"
	for file in \
		"$ROOT/agent.log" \
		"$ROOT/agent-supervisor.log" \
		"$ROOT/supervisor-stdout.log" \
		"$ROOT/legacy-agent.log" \
		"$RECOVERY_ROOT/logs/supervisor-recovery.log" \
		"$RECOVERY_ROOT/logs/recovery.jsonl"; do
		rotate_log_file "$file"
	done
}

prune_displaced_runtimes() {
	local keep="${AWTSMOOS_RUNTIME_HISTORY_KEEP:-4}"
	local count=0
	for directory in $(ls -1dt \
		"${ROOT}.failed-"* \
		"${ROOT}.incomplete-"* \
		"${ROOT}.recovery-displaced-"* \
		"${ROOT}.failed-recovery-"* 2>/dev/null || true); do
		count=$(( count + 1 ))
		[ "$count" -le "$keep" ] || rm -rf "$directory"
	done
}
