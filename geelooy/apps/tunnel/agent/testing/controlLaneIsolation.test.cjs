// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const Priority = require('../lib/runtime/priority.js');

/** Proves real, identity-bound scheduler custody rather than stale counters. */
const lanes = Priority.makeLaneState();
const limits = {
	MAX_INFLIGHT: 1,
	MAX_QUEUE: 1,
	CONTROL_QUEUE_LIMIT: 2,
	LANE_LIMITS: { p0_control: 1, p3_heavy: 1 },
	REQUESTER_QUEUE_LIMITS: { p3_heavy: 1, p0_control: 2 }
};

function item(action, requestId) {
	return { data: { payload: {
		kind: 'command', action,
		logicalAgentId: 'lane-fixture-agent',
		agentSessionId: 'lane-fixture-session',
		generation: 1, requestId
	} } };
}

Priority.enqueue(lanes, item('commandRemoteShell', 'heavy-running'));
const active = Priority.takeNext(lanes, limits, Priority.createSchedulerState());
assert.equal(active?.lane, 'p3_heavy');
Priority.enqueue(lanes, item('commandRemoteShell', 'heavy-queued'));
Priority.enqueue(lanes, item('commandStatus', 'status-ready'));

assert.equal(Priority.nextLane(lanes, limits, Priority.createSchedulerState()), 'p0_control',
	'control must start even while the heavy lane consumes all worker capacity');
assert.equal(Priority.canQueue(lanes, 'p3_heavy', limits, item('commandRemoteShell', 'heavy-third')), false);
assert.equal(Priority.canQueue(lanes, 'p0_control', limits, item('commandStatus', 'status-second')), true);
console.log(JSON.stringify({ ok: true, suite: 'control-lane-isolation', verified: ['heavy-inflight', 'control-bypass', 'queue-admission'] }));
