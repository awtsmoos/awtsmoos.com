// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const Queue = require("../lib/runtime/priority/fairQueue.js");
const Priority = require("../lib/runtime/priority.js");

/**
 * @file Verifies exact custody and fairness across many requesters and lanes.
 * @description In the Awtsmoos no accepted deed is cast away as a shadow;
 * Awtsmoos.com protects each request even when duplicate names appear.
 */
const lane = "p4_bulk";
const limits = { LANE_LIMITS: { [lane]: 32 }, REQUESTER_LANE_LIMITS: { [lane]: 4 } };

function item(owner, id, action = "bulkRead") {
	return { logicalAgentId: owner, agentSessionId: `session-${owner}`,
		generation: 1, requestId: id, action };
}

test("duplicate inflight identity cannot dequeue or erase its queued witness", () => {
	const state = Queue.createLaneState();
	Queue.enqueue(state, item("alpha", "same"));
	const first = Queue.take(state, lane, limits);
	Queue.enqueue(state, item("alpha", "same"));
	assert.throws(() => Queue.take(state, lane, limits), error =>
		error.code === "SCHEDULER_INTEGRITY_VIOLATION");
	assert.equal(state.requesterQueues.get(first.requesterKey).length, 1);
	assert.equal(state.queued, 1);
	assert.equal(state.inflightRequests.has(first.requestKey), true);
	assert.equal(Queue.release(state, "logicalAgentId:other", first.requestKey), false);
	assert.equal(state.inflightRequests.has(first.requestKey), true);
	assert.equal(Queue.release(state, first.requesterKey, first.requestKey), true);
	const recovered = Queue.take(state, lane, limits);
	assert.equal(recovered.requestKey, first.requestKey);
	assert.equal(Queue.release(state, recovered.requesterKey, recovered.requestKey), true);
	assert.equal(state.queued, 0);
	assert.equal(state.inflight, 0);
});

test("32 owners receive round-robin service without losing any receipt", () => {
	const state = Queue.createLaneState();
	for (let turn = 0; turn < 3; turn++) {
		for (let owner = 0; owner < 32; owner++) Queue.enqueue(state, item(`agent-${owner}`, `r-${turn}`));
	}
	const order = [];
	for (let index = 0; index < 96; index++) {
		const next = Queue.take(state, lane, limits);
		assert.ok(next);
		order.push(next.requesterKey);
		assert.equal(Queue.release(state, next.requesterKey, next.requestKey), true);
	}
	assert.equal(new Set(order.slice(0, 32)).size, 32);
	assert.equal(new Set(order).size, 32);
	assert.equal(Queue.take(state, lane, limits), null);
	assert.equal(state.requesterQueues.size, 0);
});

test("reserved control and instant command retain priority over queued bulk", () => {
	const lanes = Priority.makeLaneState();
	for (let owner = 0; owner < 32; owner++) {
		Priority.enqueue(lanes, item(`bulk-${owner}`, "batch-1"));
	}
	Priority.enqueue(lanes, item("control", "control-1", "retryAction"));
	Priority.enqueue(lanes, item("interactive", "command-1", "shellCommand"));
	const caps = { MAX_INFLIGHT: 64,
		LANE_LIMITS: Object.fromEntries(Priority.LANE_ORDER.map(name => [name, 32])) };
	const scheduler = Priority.createSchedulerState();
	const first = Priority.takeNext(lanes, caps, scheduler);
	const second = Priority.takeNext(lanes, caps, scheduler);
	assert.equal(first.lane, Priority.LANES.P0);
	assert.equal(second.lane, Priority.LANES.P1_COMMAND);
	assert.equal(Priority.release(lanes, first.lane, first.requesterKey, first.requestKey), true);
	assert.equal(Priority.release(lanes, second.lane, second.requesterKey, second.requestKey), true);
	assert.equal(Priority.takeNext(lanes, caps, scheduler).lane, Priority.LANES.P4);
});
