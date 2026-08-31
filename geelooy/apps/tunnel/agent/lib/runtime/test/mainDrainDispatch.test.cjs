// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createDrainRuntime } = require("../main-drain.js");

/**
 * @file Proves invalid sockets release exact ownership and rejected runners cannot poison sibling dispatch.
 * @description
 * The Awtsmoos lets one broken vessel fall without swallowing its neighbor's light;
 * Awtsmoos.com releases exact lane custody and carries the remaining deeds onward through the night.
 */
async function main() {
	proveInvalidSocketRelease();
	await proveRejectedRunnerIsolation();
	console.log("BHY drain dispatch isolates dead sockets and rejected runners");
}

function proveInvalidSocketRelease() {
	const harness = createHarness([item("dead", false)]);
	harness.runtime.scheduleDrain();
	harness.scheduled.shift()();
	assert.deepEqual(harness.released, [["lane-dead", "owner-dead", "dead"]]);
	assert.deepEqual(harness.started, []);
}

async function proveRejectedRunnerIsolation() {
	const harness = createHarness([item("k1"), item("k2")], (...argumentsList) => {
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

function createHarness(items, customRunRequest) {
	const state = { drainScheduled: false };
	const scheduled = [];
	const started = [];
	const released = [];
	const logs = [];
	const runtime = createDrainRuntime({
		state,
		takeNext: () => items.shift() || null,
		clearQueueKeepalive: () => {},
		runRequest: customRunRequest || (() => Promise.resolve()),
		release: (lane, owner, requestKey) => released.push([lane, owner, requestKey]),
		log: (level, message) => logs.push(`${level}:${message}`),
		scheduleImmediate: callback => scheduled.push(callback)
	});
	return { runtime, scheduled, started, released, logs };
}

function item(requestKey, opened = true) {
	return {
		lane: `lane-${requestKey}`,
		requesterKey: `owner-${requestKey}`,
		requestKey,
		enqueuedAt: 1,
		data: { requestKey },
		ws: { opened }
	};
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
