#!/usr/bin/env bash
# B"H
# The Awtsmoos unloads every launchd garment in one canonical runtime family before
# bootstrap. Awtsmoos.com removes stale displaced labels so obsolete guardians die.
if ! command -v service_mode >/dev/null 2>&1; then
	source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
fi

launchd_available() {
	[ "$(service_mode)" = "launchd" ] &&
		[ "$(uname -s 2>/dev/null || true)" = "Darwin" ] &&
		command -v launchctl >/dev/null 2>&1 && [ -n "${HOME:-}" ]
}

plist_value() {
	plutil -extract "$2" raw -o - "$1" 2>/dev/null || true
}

root_belongs_to_runtime_family() {
	local candidate="$1" prefix="$(dirname "$ROOT")/$(basename "$ROOT")"
	case "$candidate" in "$prefix"|"$prefix".*) return 0 ;; *) return 1 ;; esac
}

wait_for_label_unload() {
	local domain="$1" label="$2" sample=0
	while [ "$sample" -lt 40 ]; do
		launchctl print "$domain/$label" >/dev/null 2>&1 || return 0
		sleep 0.125
		sample=$((sample + 1))
	done
	return 1
}

stop_owned_launchd_plist() {
	local plist="$1" domain="$2"
	local label="$(plist_value "$plist" Label)"
	local install_root="$(plist_value "$plist" EnvironmentVariables.AWTSMOOS_INSTALL_ROOT)"
	[ -n "$label" ] && root_belongs_to_runtime_family "$install_root" || return 0
	launchctl bootout "$domain/$label" >/dev/null 2>&1 ||
		launchctl bootout "$domain" "$plist" >/dev/null 2>&1 ||
		launchctl unload -w "$plist" >/dev/null 2>&1 || true
	wait_for_label_unload "$domain" "$label" || install_event "service" "warning" \
		"Owned launchd service remained visible after bootout." \
		"label=$label root=$install_root"
	if [ "$install_root" != "$ROOT" ]; then
		rm -f "$plist"
		install_event "service" "passed" \
			"Removed stale launchd runtime-family plist." \
			"label=$label root=$install_root plist=$plist"
	fi
}

stop_launchd_service() {
	launchd_available || return 0
	local domain="$(launchd_domain)" plist=""
	for plist in "$HOME"/Library/LaunchAgents/com.awtsmoos.tunnel*.plist; do
		[ -f "$plist" ] && stop_owned_launchd_plist "$plist" "$domain"
	done
	if legacy_launchd_owned_by_root; then
		local legacy="$(legacy_launchd_plist_path)"
		launchctl bootout "$domain/$(legacy_launchd_label)" >/dev/null 2>&1 || true
		rm -f "$legacy"
	fi
}

write_launchd_service() {
	local plist="$(launchd_plist_path)" label="$(launchd_label)"
	local path_value="$(dirname "$AWTSMOOS_NODE_BIN"):${PATH:-/usr/local/bin:/usr/bin:/bin}"
	local recovery_root="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
	mkdir -p "$(dirname "$plist")"
	node - "$plist" "$ROOT" "$label" "$path_value" "$AWTSMOOS_NODE_BIN" \
		"$recovery_root" "${AWTSMOOS_ACTIVATION_ID:-}" \
		"${AWTSMOOS_RUNTIME_VERSION:-unknown}" <<'NODE'
const fs = require("node:fs");
const [plist, root, label, pathValue, nodeBin, recoveryRoot,
	activationId, runtimeVersion] = process.argv.slice(2);
const escape = value => String(value).replaceAll("&", "&amp;")
	.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const environment = { HOME: process.env.HOME || "", PATH: pathValue,
	AWTSMOOS_NODE_BIN: nodeBin, AWTSMOOS_INSTALL_ROOT: root,
	AWTSMOOS_RECOVERY_ROOT: recoveryRoot, AWTSMOOS_ACTIVATION_ID: activationId,
	AWTSMOOS_RUNTIME_VERSION: runtimeVersion };
const entries = Object.entries(environment).map(([key, value]) =>
	`<key>${key}</key><string>${escape(value)}</string>`).join("\n");
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>Label</key><string>${escape(label)}</string>
<key>ProgramArguments</key><array><string>/bin/bash</string><string>${escape(`${root}/awtsmoos-supervisor.sh`)}</string><string>${escape(root)}</string></array>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>2</integer>
<key>EnvironmentVariables</key><dict>${entries}</dict><key>WorkingDirectory</key><string>${escape(process.env.HOME || root)}</string>
<key>StandardOutPath</key><string>${escape(`${root}/launchd.out.log`)}</string><key>StandardErrorPath</key><string>${escape(`${root}/launchd.err.log`)}</string></dict></plist>\n`;
const temporary = `${plist}.${process.pid}.tmp`;
fs.writeFileSync(temporary, xml, { mode: 0o600 });
fs.renameSync(temporary, plist);
NODE
	chmod 600 "$plist"
}

start_launchd_supervisor() {
	launchd_available || return 1
	local domain="$(launchd_domain)" label="$(launchd_label)" plist="$(launchd_plist_path)"
	stop_launchd_service
	write_launchd_service
	launchctl bootstrap "$domain" "$plist" >/dev/null 2>&1 || {
		stop_launchd_service
		sleep 0.25
		launchctl bootstrap "$domain" "$plist" >/dev/null 2>&1 ||
			launchctl load -w "$plist" >/dev/null 2>&1 || return 1
	}
	launchctl kickstart -k "$domain/$label" >/dev/null 2>&1 || true
	launchd_loaded
}

source "${AWTSMOOS_INSTALL_RUNTIME:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}/unix-service-project-root.sh"
