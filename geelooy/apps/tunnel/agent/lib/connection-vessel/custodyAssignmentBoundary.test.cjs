// B"H
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Phase = require("./custody-progress-phase.js");
const Health = require("./parent-consumer-health.js");

/**
 * The Awtsmoos grants ownership only when the consumer actually begins.
 * Assignment is a promise of work, not proof of the first executed instruction.
 */
test("assigned worker is still pre-consumer without start witness", () => {
	assert.equal(Phase.fromRuntime("executor_worker_assigned", { consumerStarted: false }), "worker_starting");
});

test("assignment accompanied by start witness is running", () => {
	assert.equal(Phase.fromRuntime("executor_worker_assigned", { consumerStarted: true }), "running");
});

test("actual handler start is running, lane dequeue only queued", () => {
	assert.equal(Phase.fromRuntime("command_handler_started"), "running");
	assert.equal(Phase.fromRuntime("lane_dequeued"), "queued");
});

test("unstarted assignment is detected after pre-consumer deadline", () => {
	const phase = Phase.fromRuntime("executor_worker_assigned", { consumerStarted: false });
	const result = Health.inspect({}, { inbox: {
		parentCustodyCount: 1,
		parentCustodyOldestAgeMs: 8000,
		parentCustodyRecords: [{ id: "receipt-A", phase,
			acceptedAt: 10000, phaseStartedAt: 11000, lastProgressAt: 11000,
			childIncarnationId: "child-A" }]
	} }, { registered: true, now: () => 19000 });
	assert.equal(result.preConsumerStalled, true);
	assert.deepEqual(result.preConsumerStalledIds, ["receipt-A"]);
	assert.equal(result.consumerStalled, true);
});

test("genuine executing worker remains protected by the longer lease", () => {
	const phase = Phase.fromRuntime("command_handler_started");
	const result = Health.inspect({}, { inbox: {
		parentCustodyCount: 1, parentCustodyOldestAgeMs: 8000,
		parentCustodyRecords: [{ id: "receipt-B", phase,
			acceptedAt: 10000, phaseStartedAt: 11000, lastProgressAt: 11000 }]
	} }, { registered: true, now: () => 19000 });
	assert.equal(result.preConsumerStalled, false);
	assert.equal(result.consumerStalled, false);
});
