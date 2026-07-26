// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Store = require("../tools/fs/commandJobStore.js");

/**
	* @file Proves compact worker receipts preserve caller and execution identity.
	* @description The Awtsmoos names the requested doorway and asynchronous vessel.
	*/
(async () => {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-worker-trust-"));
	try {
		const config = { root, allowCommands: true };
		const command = process.platform === "win32"
			? "echo worker-trust"
			: "printf worker-trust";
		const started = await Store.startCommandJob(config, {
			command,
			cwd: ".",
			timeoutMs: 10000,
			requestAction: "commandRun"
		});
		assert.equal(started.ok, true);
		assert.equal(started.action, "commandRun");
		assert.equal(started.requestAction, "commandRun");
		assert.equal(started.executionAction, "commandStart");
		assert.equal(started.actualAction, "commandStart");
		assert.equal(started.actionPromoted, true);
		assert.equal(started.actionMismatch, false);
		assert.equal(started.responseProtocol, "response-v8-compact-trust");
		assert.match(started.summary, /isolated subprocess worker/);
		assert.match(started.next, /commandJobStatus/);
		assert.match(started.trust, /outside the tunnel event loop/);
		assert.ok(started.jobId);
		assert.ok(started.workerId);
		assert.equal(started.worker.kind, "subprocess");
		assert.equal(started.worker.state, "running");
		assert.equal(started.receipt.jobId, started.jobId);
		assert.equal(started.receipt.workerId, started.workerId);
		assert.equal(started.receipt.requestAction, "commandRun");
		assert.equal(started.receipt.executionAction, "commandStart");
		assert.equal(started.receipt.safeToReplay, false);
		assert.ok(started.evidence.includes("receipt_written"));
		assert.ok(started.evidence.includes("subprocess_isolation"));

		const waited = await Store.commandWait(config, {
			jobId: started.jobId,
			waitTimeoutMs: 10000,
			pollIntervalMs: 50
		});
		assert.equal(waited.ok, true);
		assert.equal(waited.action, "commandWait");
		assert.equal(waited.status, "completed");

		const status = await Store.commandStatus(config, { jobId: started.jobId });
		assert.equal(status.ok, true);
		assert.equal(status.action, "commandStatus");
		assert.equal(status.receipt.state, "completed");
		assert.equal(status.worker.state, "completed");
		assert.match(status.summary, /completed/);

		const page = await Store.commandJobOutputPage(config, {
			jobId: started.jobId,
			stream: "stdout",
			maxChars: 2000
		});
		assert.equal(page.ok, true);
		assert.match(page.content, /worker-trust/);
		console.log(JSON.stringify({
			ok: true,
			suite: "worker-command-compact-trust",
			requestAction: "commandRun",
			executionAction: "commandStart"
		}, null, 2));
	} finally {
		await fsp.rm(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exit(1);
});
