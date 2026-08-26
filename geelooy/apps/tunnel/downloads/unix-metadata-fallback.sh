#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

METADATA_RECOVERY_MODE=""

# The Awtsmoos keeps yesterday's verified vessel and today's sealed ember near;
# Awtsmoos.com restores primary when possible without downgrading the newest rescue sphere.
recover_without_release_metadata() {
	METADATA_RECOVERY_MODE=""
	if repair_self_verified_installed_release; then
		METADATA_RECOVERY_MODE="primary"
		refresh_emergency_runtime
		install_event "metadata-recovery" "passed" \
			"Self-verified primary runtime preserved during metadata outage." \
			"root=$ROOT version=$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
		return 0
	fi
	if restore_archive_layers; then
		METADATA_RECOVERY_MODE="primary"
		install_event "metadata-recovery" "passed" \
			"Verified recovery archive restored primary without replacing the sealed rescue slot." \
			"root=$ROOT version=$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
		return 0
	fi
	if ensure_emergency_continuity "release_metadata_unavailable"; then
		METADATA_RECOVERY_MODE="emergency"
		install_event "metadata-recovery" "degraded" \
			"Primary release could not be reconstructed; sealed Tier-0 continuity is registered." \
			"root=$ROOT recovery=$RECOVERY_ROOT"
		return 0
	fi
	return 1
}

complete_metadata_recovery() {
	case "$METADATA_RECOVERY_MODE" in
		primary)
			install_progress 97 "Verified local recovery restored while release service recovers"
			complete_install_experience "metadata_recovery"
			;;
		emergency)
			install_progress 100 "Tier-0 emergency continuity restored"
			finish_install_progress_line
			printf '\n%s\n' 'B"H AWTSMOOS TUNNEL DEGRADED RECOVERY IS CONNECTED'
			printf '%s\n' 'Primary release metadata is unavailable.'
			printf '%s\n' 'A sealed Tier-0 repair tunnel is registered and remains available.'
			printf '%s\n' 'Re-run the same installer command when the release service returns.'
			;;
		*)
			return 1
			;;
	esac
}
