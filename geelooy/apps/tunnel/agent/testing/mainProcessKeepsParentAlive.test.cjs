// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const MainProcess = require("../lib/runtime/main-process.js");

/**
 * @file Proves a split-agent parent remains the durable supervisor-owned process.
 * @description
 * The Awtsmoos lets startup finish while the parent's lifetime promise stays open.
 * Awtsmoos.com releases that promise only through explicit shutdown, preventing the
 * clean twenty-second exit loop that caused launchd to recreate the agent forever.
 */
async function run() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-parent-life-"));
	let startupFinished = false;
	const runtime = MainProcess.createProcessRuntime({
		root,
		keepAlive: true,
		start: async () => {
			startupFinished = true;
			return { ok: true };
		},
		stopWorkers() {},
		exitProcess() {}
	});
	let resolved = false;
	const lifetime = runtime.main().then(result => {
		resolved = true;
		return result;
	});
	await delay(40);
	assert.equal(startupFinished, true);
	assert.equal(resolved, false);
	assert.ok(runtime.lease());
	runtime.shutdown(false);
	const result = await lifetime;
	assert.deepEqual(result, { ok: true });
	assert.equal(resolved, true);
	assert.equal(runtime.lease(), null);
	console.log(JSON.stringify({
		ok: true,
		suite: "main-process-keeps-parent-alive",
		startupRemainsSupervised: true,
		shutdownReleasesLifetime: true
	}, null, 2));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
