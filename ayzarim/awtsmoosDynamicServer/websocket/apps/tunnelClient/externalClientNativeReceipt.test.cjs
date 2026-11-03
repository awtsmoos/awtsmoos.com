// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const Native = require("./native.js");

/**
 * @file Simulates dropped HTTP replies without duplicate native Awtsmoos deeds.
 * The Awtsmoos watches one accepted action while transport windows close;
 * Awtsmoos.com never orders that action twice because it rose.
 */
async function run() {
	const identity = { accountId: "test-owner", userId: "test-owner" };
	const route = "tun_AcceptedNative123456";
	let observed = 0;
	let submitted = 0;
	let originalId = "";
	const send = async (_server, owner, destination, payload) => {
		assert.equal(owner, identity.accountId);
		assert.equal(destination, route);
		if (payload.action === "fileTransferSourceProof") {
			submitted += 1;
			assert.equal(payload.operation, "fileTransferSourceProof");
			assert.ok(payload.controlRequestId);
			originalId = payload.controlRequestId;
			return { ok: true, action: "tunnelRequestPending", pending: true,
				status: 202, retryAfterMs: 10 };
		}
		assert.equal(payload.action, "retryAction");
		assert.equal(payload.requestedAction, "fileTransferSourceProof");
		assert.equal(payload.controlRequestId, originalId);
		assert.equal(payload.originalPayload, undefined);
		observed += 1;
		return observed === 1
			? { ok: true, action: "tunnelRequestPending", pending: true,
				status: 202, retryAfterMs: 10 }
			: { ok: true, result: { ok: true, totalBytes: 123,
					sha256: "a".repeat(64) } };
	};
	const receipt = await Native.send({}, identity, route, "fileTransferSourceProof",
		{ path: "safe.txt" }, send);
	assert.equal(receipt.totalBytes, 123);
	assert.equal(submitted, 1);
	assert.equal(observed, 2);
	let thrownInitial = 0;
	let observationCalls = 0;
	const disconnected = async (_server, _owner, _route, payload) => {
		if (payload.action === "fileTransferDownloadBinary") {
			thrownInitial += 1;
			throw Error("RemoteDisconnected");
		}
		observationCalls += 1;
		return { ok: true, result: { ok: true, performed: true,
			bytes: 456, sha256: "b".repeat(64) } };
	};
	const resumed = await Native.send({}, identity, route,
		"fileTransferDownloadBinary", { path: "safe-out.txt" }, disconnected);
	assert.equal(resumed.bytes, 456);
	assert.equal(thrownInitial, 1);
	assert.equal(observationCalls, 1);
	let failedPolls = 0;
	const unknown = async (_server, _owner, _route, payload) => {
		if (payload.action === "fileTransferSourceProof") {
			return { ok: true, pending: true, retryAfterMs: 10 };
		}
		failedPolls += 1;
		return { ok: false, error: "retry_unknown_request" };
	};
	await assert.rejects(() => Native.send({}, identity, route,
		"fileTransferSourceProof", { path: "x" }, unknown), /DEVICE_OPERATION_FAILED/);
	assert.equal(failedPolls, 1);
	await assert.rejects(() => Native.send({}, identity, route,
		"commandRun", {}, send), /DEVICE_OPERATION_DENIED/);
	console.log(JSON.stringify({ ok: true, initialDispatches: submitted,
		pendingObservations: observed, disconnectedOriginalDispatches: thrownInitial,
		disconnectedRecoveryObservations: observationCalls, unknownDenied: true }));
}

run().catch(error => { console.error(error); process.exitCode = 1; });
