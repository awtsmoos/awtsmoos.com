#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews every installed root with its own service identity.
# Awtsmoos.com never lets one test, account, or alternate installation seize another
# root's launchd label merely because both share a friendly tunnel name.

service_mode() {
	case "${AWTSMOOS_SERVICE_MODE:-}" in
		launchd|portable)
			printf '%s\n' "$AWTSMOOS_SERVICE_MODE"
			return 0
			;;
	esac
	if [ "$(uname -s 2>/dev/null || true)" = "Darwin" ] &&
		command -v launchctl >/dev/null 2>&1; then
		printf '%s\n' "launchd"
	else
		printf '%s\n' "portable"
	fi
}

service_instance_key() {
	node - "$ROOT" <<'NODE'
const crypto = require("node:crypto");
const path = require("node:path");
const root = path.resolve(process.argv[2] || process.cwd());
process.stdout.write(
	crypto.createHash("sha256").update(root).digest("hex").slice(0, 12)
);
NODE
}

launchd_label() {
	printf 'com.awtsmoos.tunnel.%s\n' "$(service_instance_key)"
}

legacy_launchd_label() {
	printf '%s\n' "com.awtsmoos.tunnel"
}

launchd_domain() {
	printf 'gui/%s\n' "$(id -u)"
}

launchd_plist_path() {
	printf '%s/Library/LaunchAgents/%s.plist\n' "$HOME" "$(launchd_label)"
}

legacy_launchd_plist_path() {
	printf '%s/Library/LaunchAgents/%s.plist\n' "$HOME" "$(legacy_launchd_label)"
}

launchd_loaded() {
	launchctl print "$(launchd_domain)/$(launchd_label)" >/dev/null 2>&1
}

legacy_launchd_plist_owned_by_root() {
	local plist="$(legacy_launchd_plist_path)"
	[ -f "$plist" ] && grep -Fq "$ROOT/awtsmoos-supervisor.sh" "$plist"
}

legacy_launchd_job_owned_by_root() {
	launchctl print "$(launchd_domain)/$(legacy_launchd_label)" 2>/dev/null |
		grep -Fq "$ROOT/awtsmoos-supervisor.sh"
}

legacy_launchd_owned_by_root() {
	legacy_launchd_plist_owned_by_root || legacy_launchd_job_owned_by_root
}
