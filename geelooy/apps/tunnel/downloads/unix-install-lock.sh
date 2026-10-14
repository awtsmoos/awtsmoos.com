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
# Yaakov 2026-10-14: a fresh installer run INSTANTLY replaces any older installer.
# kill_stale_installers runs at startup before anything else: every older installer
# process is signalled immediately (no waiting, no "another installer" message).
# Only installer machinery is ever touched; the live tunnel agent is never harmed,
# and our own ancestor chain (bootstrap -> custody -> this shell) is excluded.
# The 12s wait in acquire_install_lock survives only as a fallback for the rare
# case where the kill itself fails.
kill_stale_installers() {
	local self="$$"
	# Our own runtime root: every process of THIS run (bootstrap, custody
	# delegate, detached runner) references it. Older runs used a different
	# stamped runtime root, so this precisely separates ours from theirs.
	# (The custody "delegate" is detached from our process tree, so the
	# ancestor walk alone cannot see it.)
	local own_runtime="${AWTSMOOS_INSTALL_RUNTIME:-}"
	# Build the full ancestor chain as a second layer of protection.
	local ancestors=" $self "
	local p="$PPID"
	local guard=0
	while [ -n "$p" ] && [ "$p" != "0" ] && [ "$p" != "1" ] && [ "$guard" -lt 32 ]; do
		ancestors="$ancestors$p "
		p="$(ps -o ppid= -p "$p" 2>/dev/null | tr -d '[:space:]')" || break
		guard=$(( guard + 1 ))
	done
	local patterns="unix-install-core.sh unix-install-custody.cjs unix-bootstrap-run.sh unix-bootstrap-components.sh unix-candidate-probe.sh"
	local pid cmdline matched pat
	local killed=0
	while read -r pid cmdline; do
		case "$pid" in ''|*[!0-9]*) continue ;; esac
		case "$ancestors" in *" $pid "*) continue ;; esac
		if [ -n "$own_runtime" ]; then
			case "$cmdline" in *"$own_runtime"*) continue ;; esac
		fi
		matched=0
		for pat in $patterns; do
			case "$cmdline" in *"$pat"*) matched=1; break ;; esac
		done
		[ "$matched" = "1" ] || continue
		if kill -TERM "$pid" 2>/dev/null; then
			killed=$(( killed + 1 ))
		fi
	done < <(ps -eo pid=,args= 2>/dev/null)
	[ "$killed" -gt 0 ] || return 0
	# Brief grace, then force the stubborn ones (re-scan, only still-alive).
	sleep 2
	while read -r pid cmdline; do
		case "$pid" in ''|*[!0-9]*) continue ;; esac
		case "$ancestors" in *" $pid "*) continue ;; esac
		if [ -n "$own_runtime" ]; then
			case "$cmdline" in *"$own_runtime"*) continue ;; esac
		fi
		matched=0
		for pat in $patterns; do
			case "$cmdline" in *"$pat"*) matched=1; break ;; esac
		done
		[ "$matched" = "1" ] || continue
		kill -KILL "$pid" 2>/dev/null || true
	done < <(ps -eo pid=,args= 2>/dev/null)
	install_event "install-lock" "passed" \
		"Cleared a previous interrupted install." \
		"stopped ${killed} stale installer process(es); proceeding immediately"
	return 0
}

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
