// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves a verified living release is not disrupted by a routine reinstall.
 * @description
 * The Awtsmoos requires a fresh relay receipt, exact supervision, and a real local
 * executor probe. Failure of any witness falls back to the bounded restart path.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const fastRepair = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-fast-repair.sh"
);
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-healthy-current-"));

try {
	const healthy = run({ AWTS_TEST_LOCAL_READY: "1" });
	assert.equal(healthy.status, 0, `${healthy.stdout}\n${healthy.stderr}`);
	assert.match(healthy.stdout, /journal:verified_current_healthy/);
	assert.doesNotMatch(healthy.stdout, /stop_existing_runtime/);
	assert.doesNotMatch(healthy.stdout, /start_supervisor/);
	assert.match(healthy.stdout, /fast_repair_completed=1/);

	const stalledExecutor = run({ AWTS_TEST_LOCAL_READY: "0" });
	assert.equal(
		stalledExecutor.status,
		0,
		`${stalledExecutor.stdout}\n${stalledExecutor.stderr}`
	);
	assert.match(stalledExecutor.stdout, /stop_existing_runtime/);
	assert.match(stalledExecutor.stdout, /start_supervisor/);
	assert.match(stalledExecutor.stdout, /journal:repaired_current/);

	const staleReceipt = run({
		AWTS_TEST_LOCAL_READY: "1",
		AWTS_TEST_RECEIPT_READY: "0"
	});
	assert.equal(staleReceipt.status, 0, `${staleReceipt.stdout}\n${staleReceipt.stderr}`);
	assert.match(staleReceipt.stdout, /stop_existing_runtime/);

	const changedWorkspace = run({
		AWTS_TEST_LOCAL_READY: "1",
		AWTS_TEST_ROOT_CURRENT: "0"
	});
	assert.equal(
		changedWorkspace.status,
		0,
		`${changedWorkspace.stdout}\n${changedWorkspace.stderr}`
	);
	assert.match(changedWorkspace.stdout, /stop_existing_runtime/);
	assert.match(changedWorkspace.stdout, /journal:repaired_current/);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-healthy-current-fast-path",
		healthyCurrentPreservesPid: true,
		executorStallRestarts: true,
		staleReceiptRestarts: true,
		changedWorkspaceRestarts: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function run(environment) {
	const root = path.join(sandbox, `root-${Math.random().toString(36).slice(2)}`);
	fs.mkdirSync(root, { recursive: true });
	fs.writeFileSync(path.join(root, "agent.pid"), "4242\n");
	const script = `set -Eeuo pipefail
ROOT=${shellQuote(root)}
CANDIDATE_VERSION=9.9.9
installed_release_matches_metadata(){ return 0; }
install_progress(){ :; }
install_event(){ printf 'event:%s:%s\\n' "$1" "$2"; }
skip_start_requested(){ return 1; }
runtime_pid_matches(){ return 0; }
runtime_registered(){ [ "\${AWTS_TEST_RECEIPT_READY:-1}" = "1" ]; }
service_supervision_ready(){ return 0; }
local_runtime_action_ready(){ [ "\${AWTS_TEST_LOCAL_READY:-1}" = "1" ]; }
project_root_receipt_matches_runtime(){ [ "\${AWTS_TEST_ROOT_CURRENT:-1}" = "1" ]; }
service_supervision_stable(){ service_supervision_ready "$1"; }
service_health_summary(){ printf 'supervisors=1 agents=1'; }
write_activation_journal(){ printf 'journal:%s\\n' "$1"; }
stop_existing_runtime(){ printf 'stop_existing_runtime\\n'; }
migrate_runtime_device_state(){ :; }
write_supervisor(){ :; }
persist_node_runtime(){ :; }
clear_runtime_coordination_state(){ :; }
start_supervisor(){ printf 'start_supervisor\\n'; }
candidate_is_stably_active(){ return 0; }
connection_state_name(){ printf registered; }
project_root_health_summary(){ printf root=ready; }
source ${shellQuote(fastRepair)}
repair_matching_release
printf 'fast_repair_completed=%s\\n' "$FAST_REPAIR_COMPLETED"
`;
	return spawnSync("bash", ["-c", script], {
		encoding: "utf8",
		env: { ...process.env, ...environment }
	});
}

function shellQuote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}
