// B"H
// Boruch Hashem
// Blessed is He
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const RootHealth = require("../lib/runtime/project-root-health.js");

/** Agent root testimony and installer waiting share an identity-bound contract. */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const shellFile = path.join(repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-project-root-health.sh");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-health-"));
const projectRoot = path.join(root, "project");
fs.mkdirSync(projectRoot);
fs.writeFileSync(path.join(root, "config.json"), `${JSON.stringify({
	root: projectRoot,
	allowWrite: true
}, null, 2)}\n`);
fs.writeFileSync(path.join(root, "install-state.txt"), "test-version\n");
process.env.AWTSMOOS_RUNTIME_VERSION = "test-version";
try {
	const direct = RootHealth.probeProjectRoot({
		root: projectRoot,
		allowWrite: true
	}, root);
	assert.equal(direct.ok, true);
	assert.equal(runCheck("ready", root, shellFile, process.pid).status, 0);
	fs.rmSync(path.join(root, RootHealth.FILE_NAME));
	const delayed = runCheck("delayed", root, shellFile, process.pid, projectRoot);
	assert.equal(delayed.status, 0, `${delayed.stdout}\n${delayed.stderr}`);
	assert.match(delayed.stdout, /"state":"ready"/);
	writeReceipt(root, {
		...direct,
		state: "blocked",
		ok: false,
		code: "EACCES",
		updatedAt: new Date().toISOString()
	});
	assert.notEqual(runCheck("wait", root, shellFile, process.pid).status, 0);
	writeReceipt(root, { ...direct, pid: process.pid + 9999 });
	assert.notEqual(runCheck("ready", root, shellFile, process.pid).status, 0);
	console.log(JSON.stringify({
		ok: true,
		suite: "project-root-health-lifecycle",
		realReceiptAccepted: true,
		delayedReceiptWaited: true,
		blockedReceiptRejected: true,
		wrongPidRejected: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function runCheck(mode, rootPath, script, pid, delayedRoot = "") {
	return spawnSync("bash", ["-c", scriptFor(mode)], {
		encoding: "utf8",
		timeout: 10000,
		env: {
			...process.env,
			TEST_ROOT: rootPath,
			TEST_SCRIPT: script,
			TEST_PID: String(pid),
			TEST_PROJECT_ROOT: delayedRoot
		}
	});
}

function scriptFor(mode) {
	const prelude = `set -u
ROOT="$TEST_ROOT"
process_command(){ printf test-process; }
runtime_pid_matches(){ kill -0 "$1" 2>/dev/null; }
source "$TEST_SCRIPT"`;
	if (mode === "ready") return `${prelude}\nproject_root_ready "$TEST_PID" 600000`;
	if (mode === "wait") return `${prelude}\nwait_for_project_root_readiness "$TEST_PID" 2 600000`;
	return `${prelude}
( sleep 1; node - "$ROOT/project-root-state.json" "$TEST_PID" "$TEST_PROJECT_ROOT" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [file, pid, root] = process.argv.slice(2);
fs.writeFileSync(file, JSON.stringify({
	schemaVersion: 2, state: "ready", ok: true, pid: Number(pid),
	activationId: "", runtimeVersion: "test-version", root,
	canonicalRoot: fs.realpathSync(root), allowWrite: true,
	readable: true, writable: true,
	request: { action: "projectRootProbe", root }, response: { ok: true },
	updatedAt: new Date().toISOString()
}));
NODE
) &
wait_for_project_root_readiness "$TEST_PID" 5 600000
project_root_health_summary "$TEST_PID"`;
}

function writeReceipt(rootPath, value) {
	fs.writeFileSync(path.join(rootPath, RootHealth.FILE_NAME),
		`${JSON.stringify(value, null, 2)}\n`);
}
