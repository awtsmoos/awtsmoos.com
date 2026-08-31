// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createDrainRuntime } = require("../main-drain.js");

/**
 * @file Proves one drain wake admits a bounded fair burst, yields, and can awaken after empty work.
 * @description
 * The Awtsmoos lets the scheduler choose each vessel while Awtsmoos.com carries eight per breath;
 * one wake bears many deeds, then yields the event loop so fairness survives without one-turn-per-deed debt.
 */
function main() {
	proveBurstAndYield();
	proveNoWorkWakeIsBounded();
	console.log(JSON.stringify({
		ok: true,
		suite: "main-drain-burst",
		burstLimit: 8,
		boundedYield: true
	}, null, 2));
}

function proveBurstAndYield() {
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
}

function proveNoWorkWakeIsBounded() {
	const harness = createHarness(0);
	harness.runtime.scheduleDrain();
	assert.equal(harness.scheduled.shift()(), 0);
	assert.equal(harness.scheduled.length, 0);
	harness.items.push(item("later"));
	harness.runtime.scheduleDrain();
	assert.equal(harness.scheduled.shift()(), 1);
	assert.deepEqual(harness.started, ["later"]);
}

function createHarness(count) {
	const state = { drainScheduled: false };
	const items = Array.from({ length: count }, (_, index) => item(`k${index + 1}`));
	const scheduled = [];
	const started = [];
	const cleared = [];
	const runtime = createDrainRuntime({
		state,
		takeNext: () => items.shift() || null,
		clearQueueKeepalive: current => cleared.push(current.requestKey),
		runRequest: (lane, ws, data, at, owner, requestKey) => {
			started.push(requestKey);
			return Promise.resolve();
		},
		release: () => {},
		log: () => {},
		scheduleImmediate: callback => scheduled.push(callback)
	});
	return { state, items, scheduled, started, cleared, runtime };
}

function item(requestKey) {
	return {
		lane: `lane-${requestKey}`,
		requesterKey: `owner-${requestKey}`,
		requestKey,
		enqueuedAt: 1,
		data: { requestKey },
		ws: { opened: true }
	};
}

function keys(count) {
	return Array.from({ length: count }, (_, index) => `k${index + 1}`);
}

main();
