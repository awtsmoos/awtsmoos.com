#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos falls back from launchd only for proven macOS privacy denial.
project_root_permission_blocked() {
	node - "$ROOT/project-root-state.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.exit(["EPERM", "EACCES"].includes(value.code) ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}

retry_portable_supervisor_for_project_root() {
	[ "$(uname -s 2>/dev/null || true)" = "Darwin" ] || return 1
	[ "$(service_mode)" = "launchd" ] || return 1
	project_root_permission_blocked || return 1
	install_event "service" "warning" \
		"macOS denied launchd project access; starting portable guardian." \
		"root=$ROOT state=$ROOT/project-root-state.json"
	stop_existing_runtime || return 1
	export AWTSMOOS_SERVICE_MODE=portable
	if start_supervisor; then
		install_event "service" "passed" \
			"Portable guardian started after macOS project permission denial." \
			"root=$ROOT mode=portable"
		return 0
	fi
	install_event "service" "failed" \
		"Portable guardian could not start after macOS permission denial." \
		"root=$ROOT mode=portable"
	return 1
}
