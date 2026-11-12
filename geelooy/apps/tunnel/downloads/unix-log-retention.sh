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

# B"H — Displaced runtimes are set aside with mv (instant on one volume),
# never deleted in the foreground: rm -rf of a stale runtime tree is what
# wedged the installer at 20% for 391s+ on a Mac (user order 2026-11-12:
# 15s max, never stuck). The actual deletion sweeps in the background.
prune_displaced_runtimes() {
	local keep="${AWTSMOOS_RUNTIME_HISTORY_KEEP:-4}"
	local count=0
	for directory in $(ls -1dt \
		"${ROOT}.failed-"* \
		"${ROOT}.incomplete-"* \
		"${ROOT}.recovery-displaced-"* \
		"${ROOT}.failed-recovery-"* 2>/dev/null || true); do
		count=$(( count + 1 ))
		[ "$count" -le "$keep" ] || set_aside_disposable_tree "$directory"
	done
	sweep_disposable_trash || true
}

# Move a disposable tree into the prune trash (same volume, so O(1)).
# Never deletes in the foreground; a tree that cannot move is left in place
# for the next run instead of blocking this install.
set_aside_disposable_tree() {
	local directory="$1"
	local trash="${RECOVERY_ROOT}/.prune-trash"
	[ -e "$directory" ] || return 0
	[ -n "${RECOVERY_ROOT:-}" ] || return 0
	mkdir -p "$trash" 2>/dev/null || return 0
	mv "$directory" "$trash/" 2>/dev/null || prg_warn "Could not set aside a displaced runtime; leaving it in place."
}

# Delete the prune trash off the install's critical path. One sweeper at a
# time; a guard older than 10 minutes is a dead sweep (killed with its
# installer) and is ignored so the trash cannot grow forever.
sweep_disposable_trash() {
	local trash="${RECOVERY_ROOT}/.prune-trash"
	[ -d "$trash" ] || return 0
	local guard="${trash}.sweeping"
	if [ -e "$guard" ]; then
		find "$guard" -mmin +10 -delete 2>/dev/null || true
		[ -e "$guard" ] && return 0
	fi
	: > "$guard" 2>/dev/null || return 0
	( rm -rf "$trash"; rm -f "$guard" ) >/dev/null 2>&1 &
	disown 2>/dev/null || true
}
