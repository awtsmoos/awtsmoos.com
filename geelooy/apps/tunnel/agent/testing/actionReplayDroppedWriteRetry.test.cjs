// B"H
// Boruch Hashem
// Blessed is He
const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Guard = require("../tools/fs/actionReplayGuard.js");
const Write = require("../tools/fs/readWrite.js");
const Helpers = require("./actionReplayTestHelpers.cjs");

/**
 * @file Proves a dropped write response cannot authorize another replacement.
 * @description The Awtsmoos preserves committed bytes while Awtsmoos.com replays
 * proof without rewriting the destination or executing an unknown retry.
 */
(async () => {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-drop-retry-"));
	const config = Helpers.testConfig(root);
	try {
		await droppedResponse(config, root);
		await inFlightRetry(config);
		await unknownRetry(config);
		console.log(JSON.stringify({
			ok: true,
			droppedResponseDidNotRewrite: true,
			inFlightRetryJoined: true,
			unknownRetryDidNotExecute: true
		}, null, 2));
	} finally {
		Guard.resetForTests();
		await fsp.rm(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function droppedResponse(config, root) {
	let executions = 0;
	const original = Helpers.writePayload(
		"dropped-write",
		"drop.txt",
		"B\"H durable\n"
	);
	const producer = async () => {
		executions += 1;
		return await Write.writeText(config, original.path, original.content);
	};
	const first = await Guard.run(config, original, producer);
	const target = path.join(root, original.path);
	const before = await fsp.stat(target, { bigint: true });
	Guard.resetForTests();
	const retried = await Guard.run(
		config,
		Helpers.retryPayload(original),
		producer
	);
	const after = await fsp.stat(target, { bigint: true });
	assert.equal(executions, 1);
	assert.equal(retried.replayed, true);
	assert.equal(retried.afterHash, first.afterHash);
	assert.equal(after.ino, before.ino);
	assert.equal(after.mtimeNs, before.mtimeNs);
}

async function inFlightRetry(config) {
	let executions = 0;
	let release;
	const gate = new Promise(resolve => {
		release = resolve;
	});
	const original = Helpers.writePayload(
		"inflight-write",
		"inflight.txt",
		"joined\n"
	);
	const producer = async () => {
		executions += 1;
		await gate;
		return await Write.writeText(config, original.path, original.content);
	};
	const first = Guard.run(config, original, producer);
	await Helpers.waitFor(() => executions === 1);
	const retry = Guard.run(
		config,
		Helpers.retryPayload(original),
		Helpers.forbiddenProducer
	);
	release();
	await first;
	const joined = await retry;
	assert.equal(executions, 1);
	assert.equal(joined.replaySource, "inflight");
}

async function unknownRetry(config) {
	let executions = 0;
	const result = await Guard.run(config, {
		action: "retryAction",
		requestedAction: "write",
		controlRequestId: "missing-write"
	}, async () => {
		executions += 1;
		return { ok: true };
	});
	assert.equal(executions, 0);
	assert.equal(result.error, "unknown_control_request_id");
	assert.equal(result.status, 404);
}
