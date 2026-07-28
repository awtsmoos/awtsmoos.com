#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos opens the control chamber only after a real registered connection.
# Awtsmoos.com waits for the desktop opener to accept the URL, then reports truth.
force_control_open() {
	case "${AWTSMOOS_OPEN_CONTROL:-}" in
		1|true|TRUE|yes|YES|on|ON) return 0 ;;
	esac
	return 1
}

skip_control_open() {
	force_control_open && return 1
	case "${AWTSMOOS_SKIP_OPEN_CONTROL:-}" in
		1|true|TRUE|yes|YES|on|ON) return 0 ;;
	esac
	[ "${FAST_REPAIR_COMPLETED:-0}" = "1" ] && return 0
	return 1
}

control_was_recently_opened() {
	[ -f "${ROOT:-}/device-binding.json" ] || return 1
	node - "${ROOT}/device-binding.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const stamp = Date.parse(value.lastControlOpenedAt || "");
	process.exit(Number.isFinite(stamp) && Date.now() - stamp < 10 * 60 * 1000 ? 0 : 1);
} catch { process.exit(1); }
NODE
}

mark_control_opened() {
	[ -f "${ROOT:-}/device-binding.json" ] || return 0
	node - "${ROOT}/device-binding.json" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	value.lastControlOpenedAt = new Date().toISOString();
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, file);
} catch {}
NODE
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
			"Existing Tunnel Control session is preserved; no duplicate tab opened." "$url"
		return 0
	fi
	if ! force_control_open && control_was_recently_opened; then
		install_event "control" "skipped" \
			"Tunnel Control is already open from this pairing/install transaction." "$url"
		return 0
	fi
	if run_browser_opener "$url"; then
		mark_control_opened
		install_event "control" "passed" \
			"Opened Tunnel Control in the default browser." "$url"
		return 0
	fi
	install_event "control" "warning" \
		"Could not open a browser automatically; use the printed URL." "$url"
	return 0
}
