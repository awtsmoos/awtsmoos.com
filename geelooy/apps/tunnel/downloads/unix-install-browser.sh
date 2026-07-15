#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos opens the control chamber only after a real registered connection.
# Awtsmoos.com waits for the desktop opener to accept the URL, then reports truth.
skip_control_open() {
	case "${AWTSMOOS_SKIP_OPEN_CONTROL:-}" in
		1|true|TRUE|yes|YES|on|ON) return 0 ;;
	esac
	return 1
}

installer_control_url() {
	if [ -n "${AWTSMOOS_CONTROL_URL:-}" ]; then
		printf '%s\n' "$AWTSMOOS_CONTROL_URL"
		return 0
	fi
	printf '%s/apps/tunnel-control/\n' "${origin%/}"
}

run_browser_opener() {
	local url="$1"
	local opener="${AWTSMOOS_BROWSER_OPENER:-}"
	if [ -n "$opener" ] && command -v "$opener" >/dev/null 2>&1; then
		"$opener" "$url" >/dev/null 2>&1
		return $?
	fi
	if [ "$(uname -s 2>/dev/null || true)" = "Darwin" ] && command -v open >/dev/null 2>&1; then
		open "$url" >/dev/null 2>&1
		return $?
	fi
	if grep -qi microsoft /proc/version 2>/dev/null && command -v cmd.exe >/dev/null 2>&1; then
		cmd.exe /c start "" "$url" >/dev/null 2>&1
		return $?
	fi
	if command -v xdg-open >/dev/null 2>&1; then
		xdg-open "$url" >/dev/null 2>&1
		return $?
	fi
	if command -v gio >/dev/null 2>&1; then
		gio open "$url" >/dev/null 2>&1
		return $?
	fi
	return 1
}

open_tunnel_control() {
	local url="${1:-$(installer_control_url)}"
	if skip_control_open; then
		install_event "control" "skipped" \
			"Automatic Tunnel Control opening was disabled." "$url"
		return 0
	fi
	if run_browser_opener "$url"; then
		install_event "control" "passed" \
			"Opened Tunnel Control in the default browser." "$url"
		return 0
	fi
	install_event "control" "warning" \
		"Could not open a browser automatically; use the printed URL." "$url"
	return 0
}
