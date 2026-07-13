// B"H
const assert = require("node:assert/strict");
const Limits = require("../lib/runtime/limits.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");

const snapshot = SchedulerState.snapshot();

assert.equal(Limits.STRICT_ORDERING, false);
assert.equal(Limits.isUnlimited(Limits.MAX_INFLIGHT), true);
assert.equal(Limits.isUnlimited(Limits.MAX_QUEUE), true);
assert.equal(Limits.isUnlimited(Limits.CONTROL_QUEUE_LIMIT), true);
assert.equal(Number.isFinite(Limits.LANE_LIMITS.p3_heavy), true);
assert.equal(Number.isFinite(Limits.LANE_LIMITS.p4_bulk), true);
assert.equal(Number.isFinite(snapshot.maxActive), true);
assert.equal(snapshot.logicalAdmission, "unlimited_by_default");
assert.equal(snapshot.maxQueued, null);

console.log(JSON.stringify({
	ok: true,
	suite: "agent-concurrency-defaults",
	logicalAdmission: snapshot.logicalAdmission,
	physicalExecution: snapshot.maxActive
}, null, 2));
