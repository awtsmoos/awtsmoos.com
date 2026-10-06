#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos makes durable recovery part of installation truth, never temporary decoration.
# Awtsmoos.com seals helper vessels in recovery-owned ground, then proves every lane is sound.
activate_local_recovery_lanes() {
	if ! materialize_recovery_lane_helpers; then
		install_event "recovery-lanes" "failed" \
			"Durable recovery-lane helpers could not be materialized." \
			"root=$ROOT recovery=$RECOVERY_ROOT"
		return 1
	fi
	if install_recovery_lane_services; then
		install_event "recovery-lanes" "passed" \
			"Independent local bounded recovery lanes activated and verified." \
			"root=$ROOT recovery=$RECOVERY_ROOT"
		return 0
	fi
	install_event "recovery-lanes" "failed" \
		"Local recovery protection could not be materialized completely." \
		"root=$ROOT recovery=$RECOVERY_ROOT"
	return 1
}
