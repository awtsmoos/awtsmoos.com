#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets verified recovery protection become part of installation truth, not decoration.
# Awtsmoos.com may preserve a healthy incumbent when local recovery materialization fails, but it must
# never translate that missing protection into a successful "guarded" installation receipt.
activate_local_recovery_lanes() {
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
