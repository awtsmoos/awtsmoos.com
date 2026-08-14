#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The singleton guard lives outside the replaceable runtime tree. The Awtsmoos
# renews one supervisor across atomic restore; Awtsmoos.com refuses a contender
# even while ROOT is renamed and replaced beneath the existing guardian.

supervisor_guard_directory() {
	printf '%s\n' "$RECOVERY_ROOT/state/supervisor-instance.lock"
}

acquire_supervisor_guard() {
	local guard="$(supervisor_guard_directory)"
	local attempt=0
	mkdir -p "$(dirname "$guard")"
	while [ "$attempt" -lt 6 ]; do
		attempt=$(( attempt + 1 ))
		if mkdir "$guard" 2>/dev/null; then
			printf '%s\n' "$$" > "$guard/owner.pid"
			printf '%s\n' "$$" > "$SUPERVISOR_PID_FILE"
			supervisor_log "supervisor_guard_acquired" "pid=$$ guard=$guard"
			return 0
		fi
		local existing="$(cat "$guard/owner.pid" 2>/dev/null || true)"
		if [ "$existing" = "$$" ]; then
			printf '%s\n' "$$" > "$SUPERVISOR_PID_FILE"
			return 0
		fi
		if [ -z "$existing" ] && [ "$attempt" -lt 3 ]; then
			sleep 1
			continue
		fi
		if supervisor_command_contains \
			"$existing" "$ROOT/awtsmoos-supervisor.sh"; then
			supervisor_log "duplicate_supervisor_refused" \
				"existingPid=$existing contenderPid=$$ guard=$guard"
			exit 0
		fi
		quarantine_supervisor_guard "$guard" "$attempt"
	done
	supervisor_log "supervisor_guard_failed" "pid=$$ guard=$guard"
	exit 1
}

quarantine_supervisor_guard() {
	local guard="$1"
	local attempt="$2"
	local stale="${guard}.stale-$$-${attempt}-$(date +%s)"
	if mv "$guard" "$stale" 2>/dev/null; then
		rm -rf "$stale"
		supervisor_log "stale_supervisor_guard_removed" "pid=$$ guard=$guard"
	fi
}

cleanup_supervisor() {
	local guard="$(supervisor_guard_directory)"
	if [ "$(cat "$guard/owner.pid" 2>/dev/null || true)" = "$$" ]; then
		rm -rf "$guard"
	fi
	if [ "$(cat "$SUPERVISOR_PID_FILE" 2>/dev/null || true)" = "$$" ]; then
		rm -f "$SUPERVISOR_PID_FILE"
	fi
}
