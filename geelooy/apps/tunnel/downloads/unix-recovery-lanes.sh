#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos reveals one bounded actuator through several independent local doors.
# Awtsmoos.com keeps their helpers in recovery-owned stone, so temporary installer breath
# may vanish while the durable lanes still rise, survive, and carry light home.

recovery_lane_pairs() {
	cat <<'PAIRS'
http:recovery/lanes/httpServer.js
socket:recovery/lanes/unixSocket.js
file:recovery/lanes/fileTrigger.js
guardian:recovery/lanes/primaryGuardian.js
PAIRS
}

recovery_lane_helper_names() {
	cat <<'HELPERS'
unix-recovery-lane-paths.cjs
unix-recovery-lane-plist.cjs
unix-recovery-lane-detach.cjs
HELPERS
}

recovery_lane_helper_root() {
	printf '%s/bin/recovery-lanes\n' "$RECOVERY_ROOT"
}

recovery_lane_helper_path() {
	printf '%s/%s\n' "$(recovery_lane_helper_root)" "$1"
}

materialize_recovery_lane_helpers() {
	local helper=""
	local target_root="$(recovery_lane_helper_root)"
	local temporary=""
	mkdir -p "$target_root"
	while IFS= read -r helper; do
		[ -n "$helper" ] || continue
		[ -f "$AWTSMOOS_INSTALL_RUNTIME/$helper" ] || return 1
		temporary="$target_root/.${helper}.$$"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$helper" "$temporary" || return 1
		chmod 700 "$temporary" || return 1
		mv -f "$temporary" "$target_root/$helper" || return 1
	done <<EOF_HELPERS
$(recovery_lane_helper_names)
EOF_HELPERS
	return 0
}

recovery_lane_label() {
	printf 'com.awtsmoos.recovery-tunnel.%s.%s\n' "$(service_instance_key)" "$1"
}

legacy_recovery_lane_label() {
	printf 'com.awtsmoos.tunnel.%s.recovery.%s\n' "$(service_instance_key)" "$1"
}

recovery_lane_state_root() {
	printf '%s/state/recovery-lanes\n' "$RECOVERY_ROOT"
}

install_recovery_lane_services() {
	mkdir -p "$(recovery_lane_state_root)" "$RECOVERY_ROOT/logs"
	if launchd_available; then
		if install_launchd_recovery_lanes; then
			stop_portable_recovery_lanes
			return 0
		fi
		stop_launchd_recovery_lanes
	fi
	install_portable_recovery_lanes
}

stop_recovery_lane_services() {
	stop_launchd_recovery_lanes
	stop_portable_recovery_lanes
}
