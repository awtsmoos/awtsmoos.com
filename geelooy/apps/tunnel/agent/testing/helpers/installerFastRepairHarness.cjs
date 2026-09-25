// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repositoryRoot = path.resolve(__dirname, "../../../../../..");
const downloadsRoot = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const fastRepairRoot = path.join(downloadsRoot, "unix-fast-repair-root.sh");
const fastRepair = path.join(downloadsRoot, "unix-fast-repair.sh");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-fast-repair-"));

/**
 * @file Builds shell fixtures for release refresh and workspace-authority drift.
 * @description
 * The Awtsmoos lets matching vessels renew quickly while stale roots yield their claim;
 * Awtsmoos.com compares requested and installed authority before fast repair may remain.
 */
function runMatching(options = {}) {
	return runScript(options, false);
}

function runOffline(options = {}) {
	return runScript(options, true);
}

function runScript(options, offline) {
	const root = path.join(sandbox, `root-${Math.random().toString(36).slice(2)}`);
	const installedRoot = options.installedRoot || root;
	const requestedRoot = options.requestedRoot || root;
	fs.mkdirSync(root, { recursive: true });
	fs.mkdirSync(installedRoot, { recursive: true });
	fs.mkdirSync(requestedRoot, { recursive: true });
	fs.writeFileSync(path.join(root, "agent.pid"), "4242\n");
	fs.writeFileSync(path.join(root, "install-state.txt"), "8.8.8\n");
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({ root: installedRoot }));
	const verifier = offline
		? "installed_runtime_self_verified(){ return 0; }"
		: "installed_release_matches_metadata(){ return 0; }";
	const action = offline ? "repair_self_verified_installed_release" : "repair_matching_release";
	const script = `set -Eeuo pipefail
ROOT=${quote(root)}
CANDIDATE_VERSION=9.9.9
AWTSMOOS_NODE_BIN=${quote(process.execPath)}
export ROOT CANDIDATE_VERSION AWTSMOOS_NODE_BIN
${verifier}
install_progress(){ :; }
install_event(){ printf 'event:%s:%s\\n' "$1" "$2"; }
skip_start_requested(){ [ "\${AWTS_TEST_SKIP:-0}" = "1" ]; }
current_runtime_is_stably_healthy(){ [ "\${AWTS_TEST_HEALTHY:-1}" = "1" ]; }
service_health_summary(){ printf 'supervisors=1 agents=1'; }
write_activation_journal(){ printf 'journal:%s\\n' "$1"; }
stop_existing_runtime(){ printf 'stop_existing_runtime\\n'; }
migrate_runtime_device_state(){ :; }
write_supervisor(){ :; }
persist_node_runtime(){ :; }
clear_runtime_coordination_state(){ :; }
start_supervisor(){ printf 'start_supervisor\\n'; }
candidate_is_stably_active(){ return 0; }
candidate_late_readiness_grace(){ return 1; }
connection_state_name(){ printf registered; }
project_root_health_summary(){ printf root=ready; }
ensure_emergency_continuity(){ :; }
source ${quote(fastRepairRoot)}
source ${quote(fastRepair)}
${action}
printf 'fast_repair_completed=%s candidate_version=%s\\n' "$FAST_REPAIR_COMPLETED" "$CANDIDATE_VERSION"
`;
	return spawnSync("bash", ["-c", script], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_PROJECT_ROOT: requestedRoot,
			AWTSMOOS_INSTALL_CWD: requestedRoot,
			AWTS_TEST_HEALTHY: options.healthy === false ? "0" : "1",
			AWTS_TEST_SKIP: options.skip === true ? "1" : "0"
		}
	});
}

function cleanup() {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function quote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

module.exports = { cleanup, runMatching, runOffline, sandbox };
