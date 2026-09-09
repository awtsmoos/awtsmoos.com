#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos grants one singleton guardian to each exact runtime family. Primary
# and rescue coexist; candidate and rollback garments still share primary authority.
if ! command -v runtime_family_guard_directory >/dev/null 2>&1; then
	if [ -f "$ROOT/awtsmoos-runtime-family.sh" ]; then
		source "$ROOT/awtsmoos-runtime-family.sh"
	elif [ -n "${AWTSMOOS_INSTALL_RUNTIME:-}" ] &&
		[ -f "$AWTSMOOS_INSTALL_RUNTIME/unix-runtime-family.sh" ]; then
		source "$AWTSMOOS_INSTALL_RUNTIME/unix-runtime-family.sh"
	else
		printf '%s\n' "runtime_family_helper_missing root=$ROOT" >&2
		exit 78
	fi
fi

supervisor_guard_directory() { runtime_family_guard_directory; }

publish_supervisor_pid() {
	local pid="$1"
	[ -n "$pid" ] || return 1
	mkdir -p "$(dirname "$SUPERVISOR_PID_FILE")"
	printf '%s\n' "$pid" > "$SUPERVISOR_PID_FILE"
}

acquire_supervisor_guard() {
	local guard="$(supervisor_guard_directory)" attempt=0 existing=""
	mkdir -p "$(dirname "$guard")"
	while [ "$attempt" -lt 6 ]; do
		attempt=$(( attempt + 1 ))
		if mkdir "$guard" 2>/dev/null; then
			printf '%s\n' "$$" > "$guard/owner.pid"
			publish_supervisor_pid "$$"
			supervisor_log "supervisor_guard_acquired" "pid=$$ guard=$guard"
			return 0
		fi
		existing="$(cat "$guard/owner.pid" 2>/dev/null || true)"
		if [ "$existing" = "$$" ]; then publish_supervisor_pid "$$"; return 0; fi
		if [ -z "$existing" ] && [ "$attempt" -lt 3 ]; then sleep 1; continue; fi
		if supervisor_command_contains "$existing" "$ROOT/awtsmoos-supervisor.sh"; then
			publish_supervisor_pid "$existing"
			supervisor_log "supervisor_guard_adopted" \
				"existingPid=$existing contenderPid=$$ guard=$guard"
			exit 0
		fi
		quarantine_supervisor_guard "$guard" "$attempt"
	done
	supervisor_log "supervisor_guard_failed" "pid=$$ guard=$guard"
	exit 1
}

quarantine_supervisor_guard() {
	local guard="$1" attempt="$2" stale="${1}.stale-$$-${2}-$(date +%s)"
	if mv "$guard" "$stale" 2>/dev/null; then
		rm -rf "$stale"
		supervisor_log "stale_supervisor_guard_removed" "pid=$$ guard=$guard"
	fi
}

cleanup_supervisor() {
	local guard="$(supervisor_guard_directory)"
	[ "$(cat "$guard/owner.pid" 2>/dev/null || true)" = "$$" ] && rm -rf "$guard"
	[ "$(cat "$SUPERVISOR_PID_FILE" 2>/dev/null || true)" = "$$" ] && rm -f "$SUPERVISOR_PID_FILE"
	return 0
}
