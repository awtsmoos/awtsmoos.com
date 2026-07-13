#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# One installer may hold the activation doorway. The Awtsmoos renews ownership;
# Awtsmoos.com removes only locks whose recorded process no longer exists.

INSTALL_LOCK_DIRECTORY="${ROOT}.install-lock"
INSTALL_LOCK_OWNED=0

acquire_install_lock() {
	local timeout_seconds="${AWTSMOOS_INSTALL_LOCK_TIMEOUT_SECONDS:-30}"
	local elapsed=0
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		if mkdir "$INSTALL_LOCK_DIRECTORY" 2>/dev/null; then
			printf '%s\n' "$$" > "$INSTALL_LOCK_DIRECTORY/pid"
			printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$INSTALL_LOCK_DIRECTORY/acquired-at"
			INSTALL_LOCK_OWNED=1
			return 0
		fi
		if install_lock_is_stale; then
			rm -rf "$INSTALL_LOCK_DIRECTORY"
			continue
		fi
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	printf '[Awtsmoos][install-lock][failed] Another installer still owns %s\n' \
		"$INSTALL_LOCK_DIRECTORY" >&2
	return 1
}

install_lock_is_stale() {
	local owner
	owner="$(cat "$INSTALL_LOCK_DIRECTORY/pid" 2>/dev/null || true)"
	[ -z "$owner" ] && return 0
	kill -0 "$owner" 2>/dev/null && return 1
	return 0
}

release_install_lock() {
	[ "$INSTALL_LOCK_OWNED" = "1" ] || return 0
	local owner
	owner="$(cat "$INSTALL_LOCK_DIRECTORY/pid" 2>/dev/null || true)"
	if [ "$owner" = "$$" ]; then
		rm -rf "$INSTALL_LOCK_DIRECTORY"
	fi
	INSTALL_LOCK_OWNED=0
}
