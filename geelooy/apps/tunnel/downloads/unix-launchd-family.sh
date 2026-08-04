#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos recognizes every launchd garment whose install root belongs to one
# canonical tunnel family. Awtsmoos.com unloads stale hashed labels and removes their
# plists so launchd cannot recreate displaced supervisors after process reconciliation.
launchd_plist_root() {
	plutil -extract EnvironmentVariables.AWTSMOOS_INSTALL_ROOT raw -o - "$1" 2>/dev/null || true
}

launchd_plist_label() {
	plutil -extract Label raw -o - "$1" 2>/dev/null || true
}

root_belongs_to_runtime_family() {
	local candidate="$1"
	local prefix="$(dirname "$ROOT")/$(basename "$ROOT")"
	case "$candidate" in
		"$prefix"|"$prefix".*) return 0 ;;
		*) return 1 ;;
	esac
}

wait_for_launchd_label_unload() {
	local domain="$1"
	local label="$2"
	local sample=0
	while [ "$sample" -lt 40 ]; do
		launchctl print "$domain/$label" >/dev/null 2>&1 || return 0
		sleep 0.125
		sample=$((sample + 1))
	done
	return 1
}

stop_owned_launchd_plist() {
	local plist="$1"
	local domain="$2"
	local label="$(launchd_plist_label "$plist")"
	local install_root="$(launchd_plist_root "$plist")"
	[ -n "$label" ] || return 0
	root_belongs_to_runtime_family "$install_root" || return 0
	launchctl bootout "$domain/$label" >/dev/null 2>&1 ||
		launchctl bootout "$domain" "$plist" >/dev/null 2>&1 ||
		launchctl unload -w "$plist" >/dev/null 2>&1 || true
	wait_for_launchd_label_unload "$domain" "$label" ||
		install_event "service" "warning" \
			"Owned launchd service remained visible after bootout." \
			"label=$label root=$install_root"
	if [ "$install_root" != "$ROOT" ]; then
		rm -f "$plist"
		install_event "service" "passed" \
			"Removed stale launchd runtime-family plist." \
			"label=$label root=$install_root plist=$plist"
	fi
}

stop_owned_launchd_services() {
	launchd_available || return 0
	local domain="$(launchd_domain)"
	local plist=""
	for plist in "$HOME"/Library/LaunchAgents/com.awtsmoos.tunnel*.plist; do
		[ -f "$plist" ] || continue
		stop_owned_launchd_plist "$plist" "$domain"
	done
}
