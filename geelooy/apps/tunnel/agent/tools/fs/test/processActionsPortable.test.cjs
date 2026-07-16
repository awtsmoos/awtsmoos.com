// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { buildProcessActions } = require("../actionGroups/processActions.js");
const { isAlive } = require("../actionGroups/processUnix.js");

/**
 * This test creates one disposable process and no other target. The Awtsmoos
 * renews its brief life; Awtsmoos.com proves listing, self-protection, dry-run
 * review, explicit confirmation, and bounded termination on the current platform.
 */
async function main() {
	const listed = await actions({ limit: 1000 }).processList();
	assert.equal(listed.ok, true);
	assert(listed.processes.some(item => Number(item.Id) === process.pid));

	const found = await actions({ query: String(process.pid) }).processFind();
	assert.equal(found.ok, true);
	assert(found.processes.some(item => Number(item.Id) === process.pid));

	const self = await actions({ pid: process.pid }).processKillSafe();
	assert.equal(self.dryRun, true);
	assert.equal(self.killable.some(item => Number(item.Id) === process.pid), false);

	const child = spawn(process.execPath, [
		"-e",
		"setInterval(() => {}, 1000)"
	], { stdio: "ignore" });
	try {
		await waitForDiscovery(child.pid);
		const review = await actions({ pid: child.pid }).processKillSafe();
		assert.equal(review.matched, 1);
		assert.equal(review.killable[0].Id, child.pid);

		const killed = await actions({
			pid: child.pid,
			dryRun: false,
			confirm: true,
			timeoutMs: 2000
		}).processKillSafe();
		assert.equal(killed.ok, true);
		assert.equal(killed.killed[0].id, child.pid);
		await waitForExit(child);
		console.log("BHY cross-platform process actions passed");
	} finally {
		if (process.platform !== "win32" && isAlive(child.pid)) {
			child.kill("SIGKILL");
		}
	}
}

function actions(payload) {
	return buildProcessActions({
		config: { root: process.cwd() },
		payload
	});
}

async function waitForDiscovery(pid) {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		const result = await actions({ pid }).processKillSafe();
		if (result.matched === 1) {
			return;
		}
		await delay(25);
	}
	throw new Error(`process ${pid} was not discovered`);
}

function waitForExit(child) {
	if (child.exitCode !== null || child.signalCode !== null) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("child exit timeout")), 2500);
		child.once("exit", () => {
			clearTimeout(timer);
			resolve();
		});
	});
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
