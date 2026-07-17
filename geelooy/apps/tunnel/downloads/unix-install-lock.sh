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
acquire_install_lock() {
	local timeout_seconds="${AWTSMOOS_INSTALL_LOCK_TIMEOUT_SECONDS:-12}"
	local maximum_samples=$(( timeout_seconds * 10 ))
	local sample=0
	while [ "$sample" -lt "$maximum_samples" ]; do
		if mkdir "$INSTALL_LOCK_DIRECTORY" 2>/dev/null; then
			if INSTALL_LOCK_TOKEN="$(node \
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
		sleep 0.1
		sample=$(( sample + 1 ))
	done
	printf '[Awtsmoos][install-lock][failed] Another verified installer owns %s\n' \
		"$INSTALL_LOCK_DIRECTORY" >&2
	return 1
}

install_lock_owner_alive() {
	node "$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock-owner.cjs" \
		alive "$INSTALL_LOCK_DIRECTORY" "$ROOT" >/dev/null 2>&1
}

quarantine_install_lock() {
	local stale="${INSTALL_LOCK_DIRECTORY}.stale-$(date +%s)-$$"
	mv "$INSTALL_LOCK_DIRECTORY" "$stale" 2>/dev/null || return 0
	rm -rf "$stale"
}

release_install_lock() {
	[ "$INSTALL_LOCK_OWNED" = "1" ] || return 0
	if node "$AWTSMOOS_INSTALL_RUNTIME/unix-install-lock-owner.cjs" \
		owns "$INSTALL_LOCK_DIRECTORY" "$ROOT" "$INSTALL_LOCK_TOKEN" "$$" \
		>/dev/null 2>&1; then
		rm -rf "$INSTALL_LOCK_DIRECTORY"
	fi
	INSTALL_LOCK_OWNED=0
	INSTALL_LOCK_TOKEN=""
}
