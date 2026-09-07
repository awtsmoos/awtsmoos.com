// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Limits = require("../lib/runtime/limits.js");
const Profiles = require("../tools/fs/commandJob/concurrencyProfile.js");
const SchedulerState = require("../tools/fs/commandJob/schedulerState.js");

/**
 * @file Proves broad queues coexist with bounded per-owner physical execution.
 * @description The Awtsmoos lets many Awtsmoos.com messengers wait without one owner
 * taking every worker; production opens a broad fleet and bounded logical backlog.
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
assert.equal(sourceDefault.source, "recovery_or_production_profile");
assert.equal(sourceDefault.maxActive, 128);
assert.equal(sourceDefault.maxActivePerOwner, 8);
assert.equal(sourceDefault.logicalAdmission, "bounded_per_owner_high_water");
assert.equal(snapshot.logicalAdmission, "bounded_per_owner_high_water");
assert.equal(Number.isFinite(snapshot.maxActive), true);
assert.equal(Number.isFinite(snapshot.maxActivePerOwner), true);
assert.ok(snapshot.maxActivePerOwner <= snapshot.maxActive);
assert.equal(snapshot.maxQueued, 8192);
assert.equal(snapshot.maxPerOwner, 8);
assert.equal(snapshot.unlimitedQueued, false);
assert.equal(snapshot.unlimitedPerOwner, false);

if (process.env.AWTSMOOS_COMMAND_MAX_ACTIVE) {
	assert.equal(snapshot.concurrencySource, "explicit_override");
	assert.equal(
		snapshot.maxActive,
		Math.min(512, Number(process.env.AWTSMOOS_COMMAND_MAX_ACTIVE))
	);
} else {
	assert.equal(snapshot.concurrencyTier, 5);
	assert.equal(snapshot.concurrencyProfile, "production");
	assert.equal(snapshot.concurrencySource, "recovery_or_production_profile");
}

console.log(JSON.stringify({
	ok: true,
	suite: "agent-concurrency-defaults",
	logicalAdmission: snapshot.logicalAdmission,
	queuedHighWater: snapshot.maxQueued,
	activeWorkers: snapshot.maxActive,
	activeOwnerShare: snapshot.maxActivePerOwner
}, null, 2));
