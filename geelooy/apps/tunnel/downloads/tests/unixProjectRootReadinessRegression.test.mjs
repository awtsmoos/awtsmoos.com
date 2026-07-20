// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Health from "../../agent/lib/runtime/project-root-health.js";

/** Verifies exact root requests, symlinks, spaces, denial, and stale identity. */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root regression-"));
const installRoot = path.join(sandbox, "install root");
const projectRoot = path.join(sandbox, "project with spaces");
const linkedRoot = path.join(sandbox, "linked project");
const healthScript = path.resolve("geelooy/apps/tunnel/downloads/unix-project-root-health.sh");
fs.mkdirSync(installRoot);
fs.mkdirSync(projectRoot);
fs.symlinkSync(projectRoot, linkedRoot);
fs.writeFileSync(path.join(installRoot, "install-state.txt"), "9.9.9\n");
fs.writeFileSync(path.join(installRoot, "config.json"), JSON.stringify({
	root: linkedRoot,
	allowWrite: true
}));
process.env.AWTSMOOS_ACTIVATION_ID = "activation-regression";
process.env.AWTSMOOS_RUNTIME_VERSION = "9.9.9";

try {
	const ready = Health.probeProjectRoot({ root: linkedRoot, allowWrite: true }, installRoot);
	assert.equal(ready.ok, true);
	assert.equal(ready.request.root, path.resolve(linkedRoot));
	assert.equal(ready.response.ok, true);
	assert.equal(ready.runtimeVersion, "9.9.9");
	assert.equal(ready.activationId, "activation-regression");
	assert.equal(ready.canonicalRoot, fs.realpathSync(projectRoot));
	assert.equal(checkReceipt(installRoot, healthScript, ready.pid).status, 0);

	fs.chmodSync(projectRoot, 0o000);
	const denied = Health.probeProjectRoot({ root: linkedRoot, allowWrite: true }, installRoot);
	fs.chmodSync(projectRoot, 0o700);
	assert.equal(denied.state, "blocked");
	assert.equal(denied.response.code, "EACCES");
	assert.match(denied.request.root, /linked project$/);

	writeReceipt(installRoot, { ...ready, activationId: "stale-activation" });
	assert.notEqual(checkReceipt(installRoot, healthScript, ready.pid).status, 0);
	writeReceipt(installRoot, { ...ready, pid: ready.pid + 1 });
	assert.notEqual(checkReceipt(installRoot, healthScript, ready.pid).status, 0);
	writeReceipt(installRoot, { ...ready, updatedAt: "2000-01-01T00:00:00.000Z" });
	assert.notEqual(checkReceipt(installRoot, healthScript, ready.pid).status, 0);

	writeReceipt(installRoot, denied);
	const detail = failureDetail(installRoot, healthScript, ready.pid);
	assert.deepEqual(detail.request, denied.request);
	assert.equal(detail.root, linkedRoot);
	assert.equal(detail.response.code, "EACCES");
	assert.equal(detail.processIdentity.expectedPid, ready.pid);
	assert.equal(detail.runtimeVersion.installed, "9.9.9");
	assert.match(detail.failureReason, /operation not permitted|permission denied/i);
} finally {
	try { fs.chmodSync(projectRoot, 0o700); } catch {}
	fs.rmSync(sandbox, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-project-root-readiness-regression",
	spaces: true,
	symlink: true,
	permissionDenied: true,
	staleReceiptsRejected: true
}, null, 2));

function shellPrelude() {
	return `ROOT="$TEST_ROOT"\nprocess_command(){ printf 'node candidate'; }\nsource "$TEST_SCRIPT"\n`;
}

function checkReceipt(root, script, pid) {
	return spawnSync("bash", ["-c", `${shellPrelude()}project_root_ready "$TEST_PID" 600000`], {
		env: { ...process.env, TEST_ROOT: root, TEST_SCRIPT: script, TEST_PID: String(pid) },
		encoding: "utf8"
	});
}

function failureDetail(root, script, pid) {
	const result = spawnSync("bash", ["-c", `${shellPrelude()}project_root_failure_detail "$TEST_PID"`], {
		env: { ...process.env, TEST_ROOT: root, TEST_SCRIPT: script, TEST_PID: String(pid) },
		encoding: "utf8"
	});
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout);
}

function writeReceipt(root, value) {
	fs.writeFileSync(path.join(root, Health.FILE_NAME), `${JSON.stringify(value)}\n`);
}
