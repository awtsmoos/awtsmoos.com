// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const FairQueue = require("../lib/runtime/priority/fairQueue.js");
const QueueTruth = require("../lib/runtime/priority/queueTruth.js");
const { createSchedulerIntegrity } = require("../lib/runtime/priority/schedulerIntegrity.js");
const { createPressureQueue } = require("../lib/runtime/main-pressure-queue.js");

/**
 * @file Reproduces the exact shallow-copy phantom queue incident and proves healing.
 * @description
 * The Awtsmoos lets living requester queues testify over remembered counters.
 * Awtsmoos.com must turn the historical 64-with-zero-requesters contradiction into
 * an immediate repair signal instead of a permanent circuit breaker.
 */
test("cached queue 64 with zero requesters repairs immediately", () => {
	const lane = FairQueue.createLaneState();
	lane.queued = 64;
	const before = QueueTruth.snapshot(lane);
	assert.equal(before.cachedQueued, 64);
	assert.equal(before.actualQueued, 0);

	const observed = [];
	const integrity = createSchedulerIntegrity({
		laneNames: ["p3_heavy"],
		getLanes: () => ({ p3_heavy: lane }),
		onViolation: report => observed.push(report),
		escalation: fakeEscalation()
	});
	const [report] = integrity.reconcile("incident_reproduction");
	assert.equal(report.impossible, true);
	assert.equal(lane.queued, 0);
	assert.equal(lane.requesterQueues.size, 0);
	assert.equal(observed.length, 1);
});

test("pressure policy never clones canonical lane state", () => {
	const lanes = { p3_heavy: FairQueue.createLaneState() };
	const pressure = createPressureQueue({
		state: { lanes },
		stats: () => ({}),
		Circuit: { DEFAULTS: {}, canAccept: () => ({ startAllowed: false }) }
	}, () => {});
	assert.equal(pressure.lanes(), lanes);
	assert.equal(pressure.lanes().p3_heavy, lanes.p3_heavy);
	assert.equal(pressure.mayStart("p3_heavy"), false);
});

function fakeEscalation() {
	return {
		healthy: () => ({ recentViolations: 0 }),
		observe: () => ({ recentViolations: 1 }),
		status: () => ({ recentViolations: 0 })
	};
}
