// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Guard = require("../tools/fs/actionReplayGuard.js");
const Identity = require("../tools/fs/actionReplayIdentity.js");
const Store = require("../tools/fs/actionReplayStore.js");
const Write = require("../tools/fs/readWrite.js");

/**
 * @file Proves one canonical write survives concurrency and process-memory loss.
 * @description
 * The Awtsmoos joins many callers to one deed. Awtsmoos.com proves one execution,
 * durable replay, conflict rejection, atomic hash testimony, and a stable pending
 * retry seal when a restart finds a reservation without terminal proof.
 */
(async () => {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-replay-once-"));
	const config = testConfig(root);
	let executions = 0;
	const payload = writePayload("control-write-once", "first.txt", "B\"H once\n");
	try {
		const producer = async () => {
			executions += 1;
			await delay(30);
			return await Write.writeText(config, payload.path, payload.content);
		};
		const results = await Promise.all(
			Array.from({ length: 20 }, () => Guard.run(config, payload, producer))
		);
		assert.equal(executions, 1);
		assert(results.every(result => result.atomic === true));
		assert(results.every(result => result.verified === true));
		assert(results.every(result => result.afterHash === result.afterSha256));
		assert(results.every(result => /^[a-f0-9]{64}$/.test(result.afterHash)));

		Guard.resetForTests();
		const replayed = await Guard.run(config, payload, forbiddenProducer);
		assert.equal(executions, 1);
		assert.equal(replayed.replayed, true);
		assert.equal(replayed.afterHash, results[0].afterHash);
		assert.equal(replayed.beforeHash, results[0].beforeHash);

		const conflict = await Guard.run(
			config,
			{ ...payload, content: "different" },
			async () => ({ ok: true })
		);
		assert.equal(conflict.error, "control_request_id_conflict");

		const pendingPayload = writePayload(
			"control-interrupted",
			"pending.txt",
			"never rerun"
		);
		await Store.reserve(config, Identity.describe(pendingPayload));
		Guard.resetForTests();
		let pendingExecutions = 0;
		const pending = await Guard.run(config, pendingPayload, async () => {
			pendingExecutions += 1;
			return { ok: true };
		});
		assert.equal(pendingExecutions, 0);
		assert.equal(pending.error, "canonical_request_pending");
		assert.equal(pending.resumeToken, pendingPayload.controlRequestId);
		assert.equal(
			pending.retryPayload.controlRequestId,
			pendingPayload.controlRequestId
		);
		console.log(JSON.stringify({
			ok: true,
			executions,
			concurrentCallers: results.length,
			durableReplay: true,
			conflictRejected: true,
			pendingDidNotRerun: true
		}, null, 2));
	} finally {
		Guard.resetForTests();
		await fsp.rm(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function testConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, ".device-state"),
		allowWrite: true,
		tools: { fsWrite: true }
	};
}

function writePayload(controlRequestId, file, content) {
	return {
		action: "write",
		requestAction: "write",
		controlRequestId,
		clientRequestId: "client-proof",
		nonce: "nonce-proof",
		path: file,
		content
	};
}

async function forbiddenProducer() {
	throw new Error("durable replay executed producer");
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
