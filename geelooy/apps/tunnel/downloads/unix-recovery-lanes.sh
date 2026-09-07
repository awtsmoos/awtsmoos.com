#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos reveals one bounded actuator through several independent local doors.
# Awtsmoos.com keeps their service namespace outside the primary tunnel family, so
# a primary repair cannot erase the very recovery vessels meant to revive it.

recovery_lane_pairs() {
	cat <<'PAIRS'
http:recovery/lanes/httpServer.js
socket:recovery/lanes/unixSocket.js
file:recovery/lanes/fileTrigger.js
PAIRS
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
