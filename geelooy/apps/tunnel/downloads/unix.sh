#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail
export LC_ALL=C
export LANG=C

# The Awtsmoos chooses the primary vessel before any replaceable helper is trusted;
# Awtsmoos.com keeps a rescue parent's root from becoming the palace it reconstructs.
origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
canonical_root="$HOME/.awtsmoos-tunnel"
recovery_hint="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"

select_install_root() {
	local explicit_primary="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-}"
	local inherited="${AWTSMOOS_INSTALL_ROOT:-$canonical_root}"
	if [ -n "$explicit_primary" ]; then
		printf '%s\n' "$explicit_primary"
		return 0
	fi
	if [ "${AWTSMOOS_EMERGENCY_MODE:-0}" = "1" ]; then
		printf '[Awtsmoos][bootstrap][recovered] Emergency parent detected; targeting primary root.\n' >&2
		printf '%s\n' "$canonical_root"
		return 0
	fi
	case "$inherited" in
		"$recovery_hint"/emergency-runtime/*)
			printf '[Awtsmoos][bootstrap][recovered] Recovery-slot install root ignored: %s\n' "$inherited" >&2
			printf '%s\n' "$canonical_root"
			;;
		*/.awtsmoos-tunnel.candidate-*|*/.awtsmoos-tunnel.activation-rollback-*|\
		*/.awtsmoos-tunnel.failed-*|*/.awtsmoos-tunnel.incomplete-*|\
		*/.awtsmoos-tunnel.installer-runtime-*|*/.awtsmoos-tunnel.recovery-displaced-*)
			printf '[Awtsmoos][bootstrap][recovered] Transient install root ignored: %s\n' "$inherited" >&2
			printf '%s\n' "$canonical_root"
			;;
		*)
			printf '%s\n' "$inherited"
			;;
	esac
}

clear_emergency_parent_environment() {
	if [ "${AWTSMOOS_EMERGENCY_MODE:-0}" != "1" ]; then
		return 0
	fi
	unset AWTSMOOS_ACTIVATION_ID
	unset AWTSMOOS_COMMAND_MAX_ACTIVE
	unset AWTSMOOS_COMMAND_MAX_ACTIVE_PER_OWNER
	unset AWTSMOOS_COMMAND_TIER
	unset AWTSMOOS_EMERGENCY_MODE
	unset AWTSMOOS_INSTALL_CWD
	unset AWTSMOOS_LOCAL_API_PORT
	unset AWTSMOOS_MISSION_BOOT_RESUME
	unset AWTSMOOS_PROJECT_ROOT
	unset AWTSMOOS_RUNTIME_VERSION
	unset AWTSMOOS_SELF_UPDATE_DISABLED
	unset AWTSMOOS_SELF_UPDATE_MODE
}

install_root="$(select_install_root)"
clear_emergency_parent_environment
runtime_root="${install_root}.installer-runtime-$$"
mkdir -p "$(dirname "$install_root")" "$runtime_root"
if ! command -v curl >/dev/null 2>&1; then
	printf '[Awtsmoos][bootstrap][failed] curl was not found.\n' >&2
	rm -rf "$runtime_root"
	exit 1
fi

export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
export AWTSMOOS_INSTALLER_COMPONENTS_SHA256="__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"
run_script="$runtime_root/unix-bootstrap-run.sh"
if ! curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
	--speed-time 30 --speed-limit 1024 \
	"$origin/apps/tunnel/downloads/unix-bootstrap-run.sh" -o "$run_script"; then
	rm -rf "$runtime_root"
	printf '[Awtsmoos][bootstrap][failed] Could not fetch bootstrap engine.\n' >&2
	exit 1
fi
chmod +x "$run_script"
exec /bin/bash "$run_script"
