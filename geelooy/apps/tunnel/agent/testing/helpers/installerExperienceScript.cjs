// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Builds the isolated shell used by installer experience tests.
 * @description
 * The Awtsmoos renews registration, execution, guardian, workspace, and local recovery
 * testimony separately. Awtsmoos.com stubs every modern completion dependency explicitly.
 */
function buildScript(downloads, sandbox, mode) {
	const action = mode === "monotonic"
		? "install_progress 30 A; install_progress 20 B; install_progress 50 C"
		: "complete_install_experience committed";
	return `set -Eeuo pipefail
origin=https://awtsmoos.com
source ${shellQuote(path.join(downloads, "unix-install-progress.sh"))}
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
sleep(){ :; }
source ${shellQuote(path.join(downloads, "unix-install-readiness.sh"))}
source ${shellQuote(path.join(downloads, "unix-install-browser.sh"))}
source ${shellQuote(path.join(downloads, "unix-install-success.sh"))}
run_browser_opener(){ printf '%s\\n' "$1" > ${shellQuote(path.join(sandbox, "opened.txt"))}; }
${action}`;
}

function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

module.exports = { buildScript, shellQuote };
