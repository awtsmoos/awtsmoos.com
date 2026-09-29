#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail
export LC_ALL=C
export LANG=C

# The Awtsmoos chooses the primary vessel before replaceable helpers are trusted;
# Awtsmoos.com lets one wounded public doorway retry quietly instead of becoming a curl storm.
origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
canonical_root="$HOME/.awtsmoos-tunnel"
recovery_hint="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"

select_install_root() {
	local explicit_primary="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-}"
	local inherited="${AWTSMOOS_INSTALL_ROOT:-$canonical_root}"
	if [ -n "$explicit_primary" ]; then printf '%s\n' "$explicit_primary"; return 0; fi
	if [ "${AWTSMOOS_EMERGENCY_MODE:-0}" = "1" ]; then
		printf '[Awtsmoos][bootstrap][recovered] Emergency parent detected; targeting primary root.\n' >&2
		printf '%s\n' "$canonical_root"
		return 0
	fi
	case "$inherited" in
		"$recovery_hint"/emergency-runtime/*|*/.awtsmoos-tunnel.candidate-*|*/.awtsmoos-tunnel.activation-rollback-*|\
		*/.awtsmoos-tunnel.failed-*|*/.awtsmoos-tunnel.incomplete-*|*/.awtsmoos-tunnel.installer-runtime-*|\
		*/.awtsmoos-tunnel.recovery-displaced-*)
			printf '[Awtsmoos][bootstrap][recovered] Transient install root ignored: %s\n' "$inherited" >&2
			printf '%s\n' "$canonical_root"
			;;
		*) printf '%s\n' "$inherited" ;;
	esac
}

clear_emergency_parent_environment() {
	[ "${AWTSMOOS_EMERGENCY_MODE:-0}" = "1" ] || return 0
	unset AWTSMOOS_ACTIVATION_ID AWTSMOOS_COMMAND_MAX_ACTIVE AWTSMOOS_COMMAND_MAX_ACTIVE_PER_OWNER
	unset AWTSMOOS_COMMAND_TIER AWTSMOOS_EMERGENCY_MODE AWTSMOOS_INSTALL_CWD AWTSMOOS_LOCAL_API_PORT
	unset AWTSMOOS_MISSION_BOOT_RESUME AWTSMOOS_PROJECT_ROOT AWTSMOOS_RUNTIME_VERSION
	unset AWTSMOOS_SELF_UPDATE_DISABLED AWTSMOOS_SELF_UPDATE_MODE
}

initial_fetch() {
	local url="$1" destination="$2" label="$3"
	local attempt=1 delay=1 temporary="${destination}.part" error_file="${destination}.error" code="" status=0
	while [ "$attempt" -le 3 ]; do
		rm -f "$temporary" "$error_file"
		set +e
		code="$(curl -sS -L --connect-timeout 8 --max-time 45 --speed-time 20 --speed-limit 1024 \
			-o "$temporary" -w '%{http_code}' "$url" 2>"$error_file")"
		status=$?
		set -e
		if [ "$status" -eq 0 ] && [[ "$code" == 2?? ]]; then
			mv -f "$temporary" "$destination"; rm -f "$error_file"; return 0
		fi
		printf '[Awtsmoos][bootstrap][retry] %s HTTP=%s attempt=%d/3 wait=%ss\n' "$label" "${code:-000}" "$attempt" "$delay" >&2
		rm -f "$temporary" "$error_file"
		[ "$attempt" -eq 3 ] && break
		sleep "$delay"; delay=$((delay * 2)); attempt=$((attempt + 1))
	done
	return 1
}

install_root="$(select_install_root)"
clear_emergency_parent_environment
runtime_root="${install_root}.installer-runtime-$$"
mkdir -p "$(dirname "$install_root")" "$runtime_root"
command -v curl >/dev/null 2>&1 || { printf '[Awtsmoos][bootstrap][failed] curl was not found.\n' >&2; rm -rf "$runtime_root"; exit 1; }
export AWTSMOOS_INSTALL_ORIGIN="$origin" AWTSMOOS_INSTALL_ROOT="$install_root" AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
export AWTSMOOS_INSTALLER_COMPONENTS_SHA256="__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"
fetch_policy="$runtime_root/unix-bootstrap-fetch.sh"
run_script="$runtime_root/unix-bootstrap-run.sh"
if ! initial_fetch "$origin/apps/tunnel/downloads/unix-bootstrap-fetch.sh" "$fetch_policy" "bootstrap fetch policy"; then
	rm -rf "$runtime_root"; printf '[Awtsmoos][bootstrap][failed] Public installer source is temporarily unavailable; working runtime was left untouched.\n' >&2; exit 1
fi
source "$fetch_policy"
if ! bootstrap_fetch "$origin/apps/tunnel/downloads/unix-bootstrap-run.sh" "$run_script" "bootstrap engine"; then
	rm -rf "$runtime_root"; printf '[Awtsmoos][bootstrap][failed] Could not fetch bootstrap engine; working runtime was left untouched.\n' >&2; exit 1
fi
chmod +x "$fetch_policy" "$run_script"
exec /bin/bash "$run_script"
