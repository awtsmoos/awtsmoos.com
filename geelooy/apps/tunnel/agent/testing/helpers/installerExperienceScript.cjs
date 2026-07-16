// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Builds the isolated shell used by installer experience tests.
 * @description
 * The Awtsmoos renews registration, root, and guardian as separate witnesses.
 * Awtsmoos.com stubs each physical boundary explicitly so visible completion can
 * never pass because a test accidentally inherited the developer's live service.
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
project_root_ready(){ [ "\${AWTS_TEST_ROOT_READY:-1}" = "1" ]; }
project_root_health_summary(){ printf 'rootState=%s' "\${AWTS_TEST_ROOT_READY:-1}"; }
service_supervision_ready(){ [ "\${AWTS_TEST_SERVICE_READY:-1}" = "1" ]; }
service_health_summary(){ printf 'serviceState=%s' "\${AWTS_TEST_SERVICE_READY:-1}"; }
connection_state_name(){ printf disconnected; }
source ${shellQuote(path.join(downloads, "unix-install-browser.sh"))}
source ${shellQuote(path.join(downloads, "unix-install-success.sh"))}
run_browser_opener(){ printf '%s\\n' "$1" > ${shellQuote(path.join(sandbox, "opened.txt"))}; }
${action}`;
}

function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

module.exports = {
	buildScript,
	shellQuote
};
