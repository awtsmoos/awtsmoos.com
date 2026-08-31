#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos remembers old installation garments only long enough to retire them with care;
# Awtsmoos.com matches exact historical temp roots, never a random shell or the canonical guardian there.
legacy_transient_supervisor_command_matches() {
	local command="$1"
	local executable="" script="" remainder=""
	read -r executable script remainder <<< "$command"
	case "${executable##*/}" in
		bash|sh) ;;
		*) return 1 ;;
	esac
	[ "$script" = "$ROOT/awtsmoos-supervisor.sh" ] && return 1
	case "$script" in
		/var/folders/*/T/awts-install-rollback-*/live-runtime/awtsmoos-supervisor.sh|\
		/private/var/folders/*/T/awts-install-rollback-*/live-runtime/awtsmoos-supervisor.sh|\
		/tmp/awts-install-rollback-*/live-runtime/awtsmoos-supervisor.sh|\
		/private/tmp/awts-install-rollback-*/live-runtime/awtsmoos-supervisor.sh|\
		/var/folders/*/T/awts-complete-reinstall-*/live-runtime/awtsmoos-supervisor.sh|\
		/private/var/folders/*/T/awts-complete-reinstall-*/live-runtime/awtsmoos-supervisor.sh|\
		/tmp/awts-complete-reinstall-*/live-runtime/awtsmoos-supervisor.sh|\
		/private/tmp/awts-complete-reinstall-*/live-runtime/awtsmoos-supervisor.sh)
			return 0
			;;
		*) return 1 ;;
	esac
}

legacy_transient_supervisor_process_matches() {
	legacy_transient_supervisor_command_matches "$(process_command "$1")"
}

find_legacy_transient_supervisor_pids() {
	{
		find_candidate_pids "/awts-install-rollback-"
		find_candidate_pids "/awts-complete-reinstall-"
	} |
		sort -n -u |
		filter_matching_pids legacy_transient_supervisor_process_matches 1
}
