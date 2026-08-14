#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Launchd receives exact activation identity. If macOS TCC alone blocks the configured
# root, activation retries once under a durable portable guardian inheriting user access.
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
	node - "$plist" "$ROOT" "$label" "$path_value" "$AWTSMOOS_NODE_BIN" \
		"${AWTSMOOS_ACTIVATION_ID:-}" "${AWTSMOOS_RUNTIME_VERSION:-unknown}" <<'NODE'
const fs = require("node:fs");
const [plist, root, label, pathValue, nodeBin, activationId, runtimeVersion] = process.argv.slice(2);
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
	.replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const environment = { HOME: process.env.HOME || "", PATH: pathValue,
	AWTSMOOS_NODE_BIN: nodeBin, AWTSMOOS_INSTALL_ROOT: root,
	AWTSMOOS_ACTIVATION_ID: activationId, AWTSMOOS_RUNTIME_VERSION: runtimeVersion };
const environmentXml = Object.entries(environment).map(([key, value]) =>
	`<key>${key}</key><string>${escape(value)}</string>`).join("\n");
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${escape(label)}</string>
<key>ProgramArguments</key><array><string>/bin/bash</string>
<string>${escape(`${root}/awtsmoos-supervisor.sh`)}</string><string>${escape(root)}</string></array>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>2</integer>
<key>EnvironmentVariables</key><dict>${environmentXml}</dict>
<key>WorkingDirectory</key><string>${escape(process.env.HOME || root)}</string>
<key>StandardOutPath</key><string>${escape(`${root}/launchd.out.log`)}</string>
<key>StandardErrorPath</key><string>${escape(`${root}/launchd.err.log`)}</string>
</dict></plist>\n`;
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

project_root_permission_blocked() {
	node - "$ROOT/project-root-state.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.exit(["EPERM", "EACCES"].includes(value.code) ? 0 : 1);
} catch { process.exit(1); }
NODE
}

retry_portable_supervisor_for_project_root() {
	[ "$(uname -s 2>/dev/null || true)" = "Darwin" ] || return 1
	[ "$(service_mode)" = "launchd" ] || return 1
	project_root_permission_blocked || return 1
	install_event "startup" "warning" \
		"Launchd lacked project-root permission; retrying the exact candidate under a portable guardian." \
		"$(project_root_failure_detail "$(cat "$ROOT/agent.pid" 2>/dev/null || true)")"
	stop_existing_runtime || return 1
	export AWTSMOOS_SERVICE_MODE=portable
	start_supervisor
}
