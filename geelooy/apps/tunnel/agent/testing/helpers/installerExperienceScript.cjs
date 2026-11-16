// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const path = require("node:path");

/**
 * @file Build the isolated shell honoring the real current installer modes.
 * @description The Awtsmoos gives each mode its true name, each output its own stream;
 * Awtsmoos.com tests guardian and registration before declaring the tunnel's dream.
 */

/**
 * Prepare real installer modules with only hardware/OAuth-facing effects stubbed.
 * @param {string} downloads - Repository's verified Unix installer source folder.
 * @param {string} sandbox - Disposable home for the synthetic browser opener.
 * @param {string} mode - Monotonic progress or final-readiness scenario.
 * @returns {string} Complete safe test-only Bash script.
 */
function buildScript(downloads, sandbox, mode) {
	const action = mode === "monotonic"
		? "install_progress 30 A; install_progress 20 B; install_progress 50 C"
		: "complete_install_experience committed; printf 'Workspace   : %s\\n' \"$(workspace_status_label 4242)\"";
	return `set -Eeuo pipefail
origin=https://awtsmoos.com
source ${shellQuote(path.join(downloads, "unix-install-progress.sh"))}
source ${shellQuote(path.join(downloads, "unix-install-modes.sh"))}
install_event(){ :; }
install_fail(){ echo "INSTALL_FAIL:$*"; exit 77; }
skip_start_requested(){ [ "\${AWTS_TEST_SKIP_START:-0}" = "1" ]; }
runtime_pid_matches(){ return 0; }
runtime_registered(){ [ "\${AWTS_TEST_REGISTERED:-0}" = "1" ]; }
local_runtime_action_ready(){ [ "\${AWTS_TEST_LOCAL_ACTION_READY:-1}" = "1" ]; }
connection_receipt_value(){
	case "$1" in
		tunnelId) printf 'tun_experience_test' ;;
		activationId) printf 'activation_experience_test' ;;
		*) printf '' ;;
	esac
}
project_root_ready(){ [ "\${AWTS_TEST_ROOT_READY:-1}" = "1" ]; }
project_root_receipt_matches_runtime(){ [ "\${AWTS_TEST_ROOT_IDENTITY:-1}" = "1" ]; }
project_root_health_summary(){ printf 'rootState=%s' "\${AWTS_TEST_ROOT_READY:-1}"; }
runtime_health_summary(){ printf 'registrationState=%s' "\${AWTS_TEST_REGISTERED:-0}"; }
service_supervision_ready(){ [ "\${AWTS_TEST_SERVICE_READY:-1}" = "1" ]; }
wait_for_service_supervision(){ service_supervision_ready; }
service_health_summary(){ printf 'serviceState=%s' "\${AWTS_TEST_SERVICE_READY:-1}"; }
connection_state_name(){ printf disconnected; }
startup_phase_summary(){ printf 'startupPhase=test startupRank=5'; }
installer_config_value(){
	case "$1" in
		tunnelName) printf 'awt-experience-test' ;;
		root) printf '/tmp/awts-project' ;;
		*) printf '' ;;
	esac
}
activate_local_recovery_lanes(){ :; }
device_login_needed(){ return 1; }
run_device_login(){ :; }
sleep(){ :; }
source ${shellQuote(path.join(downloads, "unix-install-readiness.sh"))}
source ${shellQuote(path.join(downloads, "unix-install-browser.sh"))}
source ${shellQuote(path.join(downloads, "unix-install-success.sh"))}
run_browser_opener(){ printf '%s\\n' "$1" > ${shellQuote(path.join(sandbox, "opened.txt"))}; }
${action}`;
}

/** Quote a single shell argument, including embedded apostrophes. */
function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

module.exports = { buildScript, shellQuote };
