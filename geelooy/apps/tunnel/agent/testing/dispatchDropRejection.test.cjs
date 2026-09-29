// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createDrainRuntime } = require("../lib/runtime/main-drain.js");
const { createQueueRejection } = require("../lib/runtime/main-queue-rejection.js");

/**
 * @file Proves a dispatch-time dead socket rejects its caller explicitly instead of dropping silently.
 * @description
 * The Awtsmoos never lets a deed vanish between acceptance and execution; Awtsmoos.com
 * names the unusable vessel to the waiting caller with a retryable refusal, keeps exact
 * lane custody intact, and leaves healthy dispatch untouched.
 */
async function main() {
	proveDeadSocketRejectsCallerExplicitly();
	await proveHealthySocketDispatchesNormally();
	proveDurableSendSocketCountsAsUsable();
	proveDropRejectionCarriesRetryableRefusal();
	proveWiringReachesQueueRejection();
	console.log("BHY dispatch drop rejects the caller explicitly and healthy dispatch is untouched");
}

function proveDeadSocketRejectsCallerExplicitly() {
	const harness = createHarness([item("dead", { opened: false })]);
	harness.runtime.scheduleDrain();
	harness.scheduled.shift()();
	assert.equal(harness.rejections.length, 1);
	assert.equal(harness.rejections[0].item.requestKey, "dead");
	assert.equal(harness.rejections[0].reason, "dispatch_socket_unusable");
	assert.deepEqual(harness.released, [["p3_heavy", "owner-dead", "dead"]]);
	assert.deepEqual(harness.started, []);
}

async function proveHealthySocketDispatchesNormally() {
	const harness = createHarness([item("live", { opened: true })]);
	harness.runtime.scheduleDrain();
	harness.scheduled.shift()();
	await Promise.resolve();
	assert.deepEqual(harness.started, ["live"]);
	assert.deepEqual(harness.rejections, []);
	assert.deepEqual(harness.released, []);
}

function proveDurableSendSocketCountsAsUsable() {
	const harness = createHarness([item("proxy", { opened: false, durableSend: () => ({}) })]);
	harness.runtime.scheduleDrain();
	harness.scheduled.shift()();
	assert.deepEqual(harness.started, ["proxy"]);
	assert.deepEqual(harness.rejections, []);
}

function proveDropRejectionCarriesRetryableRefusal() {
	const completed = [];
	const events = [];
	const rejection = createQueueRejection({
		requestPayload: data => data.payload,
		retryControl: { complete: (data, payload, result) => completed.push({ data, payload, result }) },
		streamEvent: (name, payload, result) => events.push({ name, payload, result }),
		Correlation: { fields: () => ({}) },
		Send: { safeSend: () => false }
	});
	const it = item("gone", { opened: false });
	it.data = { id: "ctl_test_1", payload: { action: "commandRun" } };
	rejection.dropped(it, "p3_heavy", "dispatch_socket_unusable");
	assert.equal(completed.length, 1);
	const result = completed[0].result;
	assert.equal(result.ok, false);
	assert.equal(result.status, 503);
	assert.equal(result.error, "agent_dispatch_socket_unusable");
	assert.equal(result.reason, "dispatch_socket_unusable");
	assert.equal(result.lane, "p3_heavy");
	assert.equal(result.consumerStarted, false);
	assert.equal(result.queueWaitExpired, false);
	assert.equal(result.dispatchDrop, true);
	assert.equal(result.acceptanceState, "ACCEPTED");
	assert.equal(result.safeToRetry, true);
	assert.equal(result.reconciliationRequired, false);
	assert.equal(events.length, 1);
	assert.equal(events[0].name, "action.error");
}

function proveWiringReachesQueueRejection() {
	const main = read("../main.js");
	const queue = read("../lib/runtime/main-queue.js");
	const drain = read("../lib/runtime/main-drain.js");
	assert(main.includes("rejectDrop: (item, reason) => components.queue.rejectDispatchDrop(item, reason)"));
	assert(queue.includes("rejectDispatchDrop"));
	assert(queue.includes("rejection.dropped(item"));
	assert(drain.includes('dependencies.rejectDrop?.(item, "dispatch_socket_unusable")'));
}

function createHarness(items) {
	const state = { drainScheduled: false };
	const scheduled = [];
	const started = [];
	const released = [];
	const rejections = [];
	const runtime = createDrainRuntime({
		state,
		takeNext: () => items.shift() || null,
		clearQueueKeepalive: () => {},
		runRequest: (...argumentsList) => {
			started.push(argumentsList[5]);
			return Promise.resolve();
		},
		release: (lane, owner, requestKey) => released.push([lane, owner, requestKey]),
		rejectDrop: (item, reason) => rejections.push({ item, reason }),
		log: () => {},
		scheduleImmediate: callback => scheduled.push(callback)
	});
	return { runtime, scheduled, started, released, rejections };
}

function item(requestKey, ws) {
	return {
		lane: "p3_heavy",
		requesterKey: `owner-${requestKey}`,
		requestKey,
		enqueuedAt: Date.now() - 1500,
		data: { id: `ctl_${requestKey}`, payload: { action: "commandRun" } },
		ws
	};
}

function read(relative) {
	return fs.readFileSync(path.resolve(__dirname, relative), "utf8");
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
