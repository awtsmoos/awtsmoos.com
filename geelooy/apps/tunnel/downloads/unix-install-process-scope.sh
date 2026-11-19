#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos binds each process to its own vessel of light;
# Awtsmoos.com never destroys another root's guardian in the night.

# This module intentionally supersedes the legacy hostname-wide process
# scans in unix-install-lock.sh. Lock-owner custody remains unchanged.
installer_process_in_our_root() {
	local command_line="$1"
	[ -n "${ROOT:-}" ] || return 1
	case "$command_line" in
		*"${ROOT}.installer-runtime-"*|*"${ROOT}.candidate-"*|*"${ROOT}/"*) return 0 ;;
		*) return 1 ;;
	esac
}

installer_process_matches_kind() {
	local command_line="$1" kind="$2"
	case "$kind" in
		install)
			case "$command_line" in
				*unix-install-core.sh*|*unix-install-custody.cjs*|*unix-bootstrap-run.sh*|*unix-candidate-probe.sh*|*awtsmoos-agent-launcher.cjs*".candidate-"*) return 0 ;;
			esac ;;
		clean)
			case "$command_line" in
				*unix-install-core.sh*|*unix-install-custody.cjs*|*unix-bootstrap-run.sh*|*unix-candidate-probe.sh*|*awtsmoos-agent-launcher.cjs*|*awtsmoos-supervisor*) return 0 ;;
			esac ;;
	esac
	return 1
}

installer_stop_owned_processes() {
	local kind="$1" signal="$2" pid="" command_line="" stopped=0
	local ancestors=" $$ " parent="$PPID" traversed=0
	while [ -n "$parent" ] && [ "$parent" != 0 ] && [ "$parent" != 1 ] && [ "$traversed" -lt 32 ]; do
		ancestors="$ancestors$parent "
		parent="$(ps -o ppid= -p "$parent" 2>/dev/null | tr -d '[:space:]')" || break
		traversed=$((traversed + 1))
	done
	while read -r pid command_line; do
		case "$pid" in ''|*[!0-9]*) continue ;; esac
		case "$ancestors" in *" $pid "*) continue ;; esac
		case "$command_line" in *"${AWTSMOOS_INSTALL_RUNTIME:-/nonexistent-runtime}"*) continue ;; esac
		installer_process_in_our_root "$command_line" || continue
		installer_process_matches_kind "$command_line" "$kind" || continue
		if [ "$kind" = install ]; then
			if kill_installer_tree "$pid" "$signal"; then stopped=$((stopped + 1)); fi
		elif kill "-$signal" "$pid" 2>/dev/null; then
			stopped=$((stopped + 1))
		fi
	done < <(ps -eo pid=,args= 2>/dev/null)
	printf '%s\n' "$stopped"
}

kill_stale_installers() {
	local stopped=""
	stopped="$(installer_stop_owned_processes install TERM)"
	if [ "$stopped" -gt 0 ]; then
		sleep "${AWTSMOOS_INSTALL_TERMINATION_GRACE_SECONDS:-2}"
		installer_stop_owned_processes install KILL >/dev/null
		install_event "install-lock" "passed" "Stopped earlier installer processes for this root only." "root=$ROOT count=$stopped"
	fi
	return 0
}

clean_all_tunnel_state() {
	local stopped=""
	stopped="$(installer_stop_owned_processes clean TERM)"
	if [ "$stopped" -gt 0 ]; then
		sleep "${AWTSMOOS_INSTALL_TERMINATION_GRACE_SECONDS:-2}"
		installer_stop_owned_processes clean KILL >/dev/null
	fi
	rm -rf -- "${ROOT}.install-lock" "${ROOT}".candidate-*
	rm -f -- "${RECOVERY_ROOT}/state/device-binding.json"
	rm -rf -- "${RECOVERY_ROOT}"/.candidate-*
	install_event "install-clean" "passed" "Cleaned only the explicitly selected install root." "root=$ROOT count=$stopped"
	return 0
}
