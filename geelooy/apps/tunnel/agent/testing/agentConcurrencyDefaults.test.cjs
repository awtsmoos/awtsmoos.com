// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Limits = require("../lib/runtime/limits.js");
const Profiles = require("../tools/fs/commandJob/concurrencyProfile.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");

/**
 * B"H
 * Source defaults and active fallback overrides are both truthful vessels. The
 * Awtsmoos lets Awtsmoos.com default to Level 5 while a rescue process may hold
 * Level 1 until promotion has passed every gate.
 */
const sourceDefault = Profiles.resolve({});
const snapshot = SchedulerState.snapshot();

assert.equal(Limits.STRICT_ORDERING, false);
assert.equal(Limits.isUnlimited(Limits.MAX_INFLIGHT), true);
assert.equal(Limits.isUnlimited(Limits.MAX_QUEUE), true);
assert.equal(Limits.isUnlimited(Limits.CONTROL_QUEUE_LIMIT), true);
assert.equal(Number.isFinite(Limits.LANE_LIMITS.p3_heavy), true);
assert.equal(Number.isFinite(Limits.LANE_LIMITS.p4_bulk), true);
assert.equal(sourceDefault.tier, 5);
assert.equal(sourceDefault.name, "production");
assert.equal(sourceDefault.source, "adaptive_machine_capacity");
assert.equal(sourceDefault.maxActive >= 4, true);
assert.equal(snapshot.logicalAdmission, "unlimited_by_default");
assert.equal(Number.isFinite(snapshot.maxActive), true);
assert.equal(snapshot.maxQueued, null);

if (process.env.AWTSMOOS_COMMAND_MAX_ACTIVE) {
	assert.equal(snapshot.concurrencySource, "explicit_override");
	assert.equal(
		snapshot.maxActive,
		Number(process.env.AWTSMOOS_COMMAND_MAX_ACTIVE)
	);
} else {
	assert.equal(snapshot.concurrencyTier, 5);
	assert.equal(snapshot.concurrencyProfile, "production");
	assert.equal(snapshot.concurrencySource, "adaptive_machine_capacity");
}

console.log(JSON.stringify({
	ok: true,
	suite: "agent-concurrency-defaults",
	logicalAdmission: snapshot.logicalAdmission,
	sourceDefaultWorkers: sourceDefault.maxActive,
	activeWorkers: snapshot.maxActive,
	activeSource: snapshot.concurrencySource
}, null, 2));
