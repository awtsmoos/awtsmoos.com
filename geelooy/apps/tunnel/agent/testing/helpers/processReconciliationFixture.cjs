// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const { spawn } = require("node:child_process");

/**
 * @file Creates exact-root process shapes and the isolated reconciliation shell.
 * @description
 * The Awtsmoos renews test agent, launcher, supervisor, and unrelated witness.
 * Awtsmoos.com names only production paths in the repair script so process cleanup
 * can be tested without interpolating fixture state into the parent command line.
 */
function createProcesses(root) {
	writeNodeLoop(`${root}/main.js`);
	writeNodeLoop(`${root}/awtsmoos-agent-launcher.cjs`);
	writeShellLoop(`${root}/awtsmoos-supervisor.sh`);
	writeNodeLoop(`${root}/unrelated.js`);
	return [
		spawn(process.execPath, [`${root}/main.js`], { stdio: "ignore" }),
		spawn(process.execPath, [`${root}/awtsmoos-agent-launcher.cjs`], { stdio: "ignore" }),
		spawn("bash", [`${root}/awtsmoos-supervisor.sh`], { stdio: "ignore" }),
		spawn(process.execPath, [`${root}/unrelated.js`], { stdio: "ignore" })
	];
}

function reconciliationScript() {
	return [
		"set -Eeuo pipefail",
		'ROOT="$TEST_ROOT"',
		'RECOVERY_ROOT="${TEST_ROOT}-recovery"',
		"legacy_process_pids(){ :; }",
		"legacy_process_matches(){ return 1; }",
		'legacy_mode_receipt_path(){ printf "%s\\n" "$ROOT/legacy-mode.json"; }',
		"stop_launchd_service(){ :; }",
		'clear_connection_receipt(){ rm -f "$ROOT/connection-state.json"; }',
		'clear_project_root_receipt(){ rm -f "$ROOT/project-root-state.json"; }',
		"install_event(){ :; }",
		'install_fail(){ echo "$2" >&2; return 1; }',
		'source "$TEST_DOWNLOADS/unix-process-census.sh"',
		'source "$TEST_DOWNLOADS/unix-process-runtime.sh"',
		"stop_existing_runtime",
		'printf "count=%s\\n" "$(exact_root_process_count)"'
	].join("\n");
}

function writeNodeLoop(file) {
	fs.writeFileSync(file, "setInterval(() => {}, 1000);\n");
}

function writeShellLoop(file) {
	fs.writeFileSync(file, "#!/usr/bin/env bash\nwhile true; do sleep 1; done\n", {
		mode: 0o755
	});
}

module.exports = {
	createProcesses,
	reconciliationScript
};
