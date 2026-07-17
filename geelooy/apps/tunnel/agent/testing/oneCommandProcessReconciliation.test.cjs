// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Fixture = require("./helpers/processReconciliationFixture.cjs");

/**
 * @file Proves one repair invocation ends every conflicting exact-root process only.
 * @description
 * The Awtsmoos renews supervisor and agent without confusing nearby Node vessels.
 * Awtsmoos.com terminates two agents and one supervisor for the chosen root, preserves
 * an unrelated child, clears stale coordination state, and proves zero remain.
 */
(async () => {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-process-reconcile-"));
	const children = Fixture.createProcesses(root);
	const unrelated = children.at(-1);
	try {
		fs.mkdirSync(path.join(root, ".agent-instance.lock"));
		fs.mkdirSync(path.join(root, ".supervisor-instance.lock"));
		fs.writeFileSync(path.join(root, "agent.pid"), "999999\n");
		await delay(300);
		const result = spawnSync("bash", ["-c", Fixture.reconciliationScript()], {
			encoding: "utf8",
			env: {
				...process.env,
				TEST_ROOT: root,
				TEST_DOWNLOADS: downloads
			}
		});
		assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
		assert.match(result.stdout, /count=0/);
		assert.equal(processAlive(unrelated.pid), true);
		for (const name of [
			".agent-instance.lock",
			".supervisor-instance.lock",
			"agent.pid"
		]) {
			assert.equal(fs.existsSync(path.join(root, name)), false, name);
		}
		console.log(JSON.stringify({
			ok: true,
			suite: "one-command-process-reconciliation",
			allExactRootProcessesStopped: true,
			unrelatedProcessPreserved: true,
			staleCoordinationCleared: true
		}, null, 2));
	} finally {
		for (const child of children) {
			if (processAlive(child.pid)) child.kill("SIGKILL");
		}
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function processAlive(pid) {
	try { process.kill(pid, 0); return true; } catch { return false; }
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
