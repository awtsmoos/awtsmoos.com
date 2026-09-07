#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets a healthy primary crown independent recovery lanes without confusing their gates.
# Awtsmoos.com records degraded lane activation as evidence while preserving an already-verified tunnel.
activate_local_recovery_lanes() {
	if install_recovery_lane_services; then
		install_event "recovery-lanes" "passed" \
			"Independent local bounded recovery lanes activated." \
			"root=$ROOT recovery=$RECOVERY_ROOT"
		return 0
	fi
	install_event "recovery-lanes" "warning" \
		"Primary tunnel is healthy, but local recovery lane activation was incomplete." \
		"root=$ROOT recovery=$RECOVERY_ROOT"
	return 0
}
