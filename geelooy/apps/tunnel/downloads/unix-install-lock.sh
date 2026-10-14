#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

INSTALL_LOCK_DIRECTORY="${ROOT}.install-lock"
INSTALL_LOCK_OWNED=0
INSTALL_LOCK_TOKEN=""

# One installer owns the activation doorway by PID, process signature, root, and token.
# The Awtsmoos renews stale state without stealing a living installer; Awtsmoos.com
# passes the durable shell PID explicitly and releases only that exact owner token.
#
# Yaakov 2026-10-14: no silent hangs, no manual rm -rf. Every node call here is
# bounded by run_with_timeout; a dead owner is cleared automatically with a
# beautiful note; only a truly live owner ever blocks — and the wait is visible.
acquire_install_lock() {
	local timeout_seconds="${AWTSMOOS_INSTALL_LOCK_TIMEOUT_SECONDS:-12}"
	local sample=0
	local announced_wait=0
	# One liveness probe per second: each node+ps probe costs ~1s itself, so
	# counting seconds (not 0.1s samples) keeps the real wait near the
	# advertised timeout instead of ballooning to minutes.
	while [ "$sample" -lt "$timeout_seconds" ]; do
		if mkdir "$INSTALL_LOCK_DIRECTORY" 2>/dev/null; then
			if INSTALL_LOCK_TOKEN="$(run_with_timeout 20 "install lock claim" -- node \
				"$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock-owner.cjs" \
				create "$INSTALL_LOCK_DIRECTORY" "$ROOT" "$$")"; then
				INSTALL_LOCK_OWNED=1
				return 0
			fi
			rm -rf "$INSTALL_LOCK_DIRECTORY"
			return 1
		fi
		if ! install_lock_owner_alive; then
			quarantine_install_lock
			continue
		fi
		if [ "$announced_wait" = "0" ]; then
			prg_info "Another installer is working — waiting for it to finish…"
			announced_wait=1
		fi
		sleep 1
		sample=$(( sample + 1 ))
	done
	prg_warn "Another installer still holds the install lock after ${timeout_seconds}s."
	return 1
}

install_lock_owner_alive() {
	run_with_timeout 15 "install lock owner check" -- \
		node "$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock-owner.cjs" \
		alive "$INSTALL_LOCK_DIRECTORY" "$ROOT" >/dev/null 2>&1
}

# Yaakov 2026-10-14: the human never rm -rf's a stale lock again. Called at
# startup before acquire_install_lock: a dead owner is cleared automatically
# with a beautiful note; a live owner is left alone (acquire waits visibly).
clear_stale_install_lock() {
	[ -d "$INSTALL_LOCK_DIRECTORY" ] || return 0
	if install_lock_owner_alive; then
		return 0
	fi
	install_event "install-lock" "passed" \
		"Cleaned up an interrupted install." \
		"stale lock from a dead process removed automatically"
	rm -rf "$INSTALL_LOCK_DIRECTORY"
}

quarantine_install_lock() {
	local stale="${INSTALL_LOCK_DIRECTORY}.stale-$(date +%s)-$$"
	mv "$INSTALL_LOCK_DIRECTORY" "$stale" 2>/dev/null || return 0
	rm -rf "$stale"
}

release_install_lock() {
	[ "$INSTALL_LOCK_OWNED" = "1" ] || return 0
	if run_with_timeout 15 "install lock release" -- \
		node "$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock-owner.cjs" \
		owns "$INSTALL_LOCK_DIRECTORY" "$ROOT" "$INSTALL_LOCK_TOKEN" "$$" \
		>/dev/null 2>&1; then
		rm -rf "$INSTALL_LOCK_DIRECTORY"
	fi
	INSTALL_LOCK_OWNED=0
	INSTALL_LOCK_TOKEN=""
}
