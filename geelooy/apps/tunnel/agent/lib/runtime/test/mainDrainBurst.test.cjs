// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createDrainRuntime } = require("../main-drain.js");

/**
 * @file Proves one wake carries a bounded fair burst, then yields the event-loop floor.
 * @description
 * The Awtsmoos lets the existing scheduler choose each vessel while Awtsmoos.com bears eight per breath;
 * no lane is re-ranked, no dead socket steals ownership, and one rejected runner cannot halt the rest.
 * After the measured burst the event loop receives its turn, dissolving one-wake-per-deed debt.
 */
async function main() {
	await proveBurstAndYield();
	proveInvalidSocketRelease();
	await proveRejectedRunnerIsolation();
	proveNoWorkWakeIsBounded();
	console.log(JSON.stringify({
		ok: true,
		suite: "main-drain-burst",
		burstLimit: 8,
		fairOrderPreserved: true,
		boundedYield: true
	}, null, 2));
}

async function proveBurstAndYield() {
	const harness = createHarness(9);
	assert.equal(harness.runtime.scheduleDrain(), true);
	assert.equal(harness.runtime.scheduleDrain(), false);
	assert.equal(harness.scheduled.length, 1);
	assert.equal(harness.scheduled.shift()(), 8);
	assert.deepEqual(harness.started, keys(8));
	assert.deepEqual(harness.cleared, keys(8));
	assert.equal(harness.items.length, 1);
	assert.equal(harness.scheduled.length, 1);
	assert.equal(harness.scheduled.shift()(), 1);
	assert.deepEqual(harness.started, keys(9));
	assert.equal(harness.scheduled.length, 0);
	assert.equal(harness.state.drainScheduled, false);
	await Promise.resolve();
}

function proveInvalidSocketRelease() {
	const harness = createHarness(0);
	harness.items.push(item("dead", false));
	harness.runtime.scheduleDrain();
	harness.scheduled.shift()();
	assert.deepEqual(harness.released, [["lane-dead", "owner-dead", "dead"]]);
	assert.deepEqual(harness.started, []);
}

async function proveRejectedRunnerIsolation() {
	const harness = createHarness(2, (...argumentsList) => {
		const requestKey = argumentsList[5];
		harness.started.push(requestKey);
		return requestKey === "k1"
			? Promise.reject(new Error("first runner failed"))
			: Promise.resolve();
	});
	harness.runtime.scheduleDrain();
	harness.scheduled.shift()();
	await Promise.resolve();
	await Promise.resolve();
	assert.deepEqual(harness.started, ["k1", "k2"]);
	assert.equal(harness.logs.some(message => message.includes("first runner failed")), true);
}

function proveNoWorkWakeIsBounded() {
	const harness = createHarness(0);
	harness.runtime.scheduleDrain();
	assert.equal(harness.scheduled.shift()(), 0);
	assert.equal(harness.scheduled.length, 0);
	harness.items.push(item("later", true));
	harness.runtime.scheduleDrain();
	assert.equal(harness.scheduled.shift()(), 1);
	assert.deepEqual(harness.started, ["later"]);
}

function createHarness(count, customRunRequest) {
	const state = { drainScheduled: false };
	const items = Array.from({ length: count }, (_, index) => item(`k${index + 1}`, true));
	const scheduled = [];
	const started = [];
	const cleared = [];
	const released = [];
	const logs = [];
	const runRequest = customRunRequest || ((lane, ws, data, at, owner, requestKey) => {
		started.push(requestKey);
		return Promise.resolve();
	});
	const runtime = createDrainRuntime({
		state,
		takeNext: () => items.shift() || null,
		clearQueueKeepalive: current => cleared.push(current.requestKey),
		runRequest,
		release: (lane, owner, requestKey) => released.push([lane, owner, requestKey]),
		log: (level, message) => logs.push(`${level}:${message}`),
		scheduleImmediate: callback => scheduled.push(callback)
	});
	return { state, items, scheduled, started, cleared, released, logs, runtime };
}

function item(requestKey, opened) {
	return {
		lane: `lane-${requestKey}`,
		requesterKey: `owner-${requestKey}`,
		requestKey,
		enqueuedAt: 1,
		data: { requestKey },
		ws: { opened }
	};
}

function keys(count) {
	return Array.from({ length: count }, (_, index) => `k${index + 1}`);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
