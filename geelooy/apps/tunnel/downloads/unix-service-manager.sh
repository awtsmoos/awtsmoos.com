#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews each installed root under a distinct service identity.
# Awtsmoos.com gives launchd the exact remembered Node binary and PATH, migrates only
# a legacy job proven to own this root, and never depends on an interactive shell.

if ! command -v service_mode >/dev/null 2>&1; then
	source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
fi

launchd_available() {
	[ "$(service_mode)" = "launchd" ] &&
		[ "$(uname -s 2>/dev/null || true)" = "Darwin" ] &&
		command -v launchctl >/dev/null 2>&1 && [ -n "${HOME:-}" ]
}

stop_launchd_service() {
	launchd_available || return 0
	local domain="$(launchd_domain)"
	local label="$(launchd_label)"
	local plist="$(launchd_plist_path)"
	launchctl bootout "$domain/$label" >/dev/null 2>&1 ||
		launchctl bootout "$domain" "$plist" >/dev/null 2>&1 ||
		launchctl unload -w "$plist" >/dev/null 2>&1 || true
	if legacy_launchd_owned_by_root; then
		local legacy_label="$(legacy_launchd_label)"
		local legacy_plist="$(legacy_launchd_plist_path)"
		launchctl bootout "$domain/$legacy_label" >/dev/null 2>&1 ||
			launchctl bootout "$domain" "$legacy_plist" >/dev/null 2>&1 ||
			launchctl unload -w "$legacy_plist" >/dev/null 2>&1 || true
		rm -f "$legacy_plist"
	fi
}

write_launchd_service() {
	local plist="$(launchd_plist_path)"
	local label="$(launchd_label)"
	local path_value="$(dirname "$AWTSMOOS_NODE_BIN"):${PATH:-/usr/local/bin:/usr/bin:/bin}"
	mkdir -p "$(dirname "$plist")"
	node - "$plist" "$ROOT" "$label" "$path_value" "$AWTSMOOS_NODE_BIN" <<'NODE'
const fs = require("node:fs");
const [plist, root, label, pathValue, nodeBin] = process.argv.slice(2);
const escape = value => String(value)
	.replaceAll("&", "&amp;")
	.replaceAll("<", "&lt;")
	.replaceAll(">", "&gt;")
	.replaceAll('"', "&quot;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${escape(label)}</string>
<key>ProgramArguments</key><array>
<string>/bin/bash</string>
<string>${escape(`${root}/awtsmoos-supervisor.sh`)}</string>
<string>${escape(root)}</string>
</array>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>2</integer>
<key>EnvironmentVariables</key><dict>
<key>HOME</key><string>${escape(process.env.HOME || "")}</string>
<key>PATH</key><string>${escape(pathValue)}</string>
<key>AWTSMOOS_NODE_BIN</key><string>${escape(nodeBin)}</string>
<key>AWTSMOOS_INSTALL_ROOT</key><string>${escape(root)}</string>
</dict>
<key>WorkingDirectory</key><string>${escape(process.env.HOME || root)}</string>
<key>StandardOutPath</key><string>${escape(`${root}/launchd.out.log`)}</string>
<key>StandardErrorPath</key><string>${escape(`${root}/launchd.err.log`)}</string>
</dict></plist>
`;
const temporary = `${plist}.${process.pid}.tmp`;
fs.writeFileSync(temporary, xml, { mode: 0o600 });
fs.renameSync(temporary, plist);
NODE
	chmod 600 "$plist"
}

start_launchd_supervisor() {
	launchd_available || return 1
	local domain="$(launchd_domain)"
	local label="$(launchd_label)"
	local plist="$(launchd_plist_path)"
	stop_launchd_service
	write_launchd_service
	launchctl bootstrap "$domain" "$plist" >/dev/null 2>&1 ||
		launchctl load -w "$plist" >/dev/null 2>&1 || return 1
	launchctl kickstart -k "$domain/$label" >/dev/null 2>&1 || true
	launchd_loaded
}
