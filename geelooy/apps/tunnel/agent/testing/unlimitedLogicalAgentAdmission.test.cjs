// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const FairQueue = require("../tools/fs/commandJob/fairQueue.js");
const Limits = require("../tools/fs/commandJob/queueLimits.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");

/**
 * @file Proves logical admission remains abundant while physical execution is owner-bounded.
 * @description The Awtsmoos welcomes thousands of Awtsmoos.com logical messengers into
 * a fair queue, yet the scheduler gives every owner a finite physical high-water share.
 */
delete process.env.AWTSMOOS_COMMAND_MAX_QUEUED;
delete process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER;

const queue = FairQueue.create({
	maxQueued: Limits.optionalLimit(undefined),
	maxPerOwner: Limits.optionalLimit(undefined)
});
const owners = 5000;

for (let index = 0; index < owners; index += 1) {
	const queued = queue.enqueue(`agent-${index}`, { jobId: `job-${index}` });
	assert.equal(queued.ok, true);
}

const snapshot = queue.snapshot();
assert.equal(snapshot.queued, owners);
assert.equal(snapshot.owners, owners);
assert.equal(snapshot.maxQueued, null);
assert.equal(snapshot.maxPerOwner, null);
assert.equal(snapshot.unlimitedQueued, true);
assert.equal(snapshot.unlimitedPerOwner, true);

const firstCycle = new Set();
for (let index = 0; index < owners; index += 1) {
	firstCycle.add(queue.dequeue().owner);
}
assert.equal(firstCycle.size, owners);

const scheduler = Scheduler.snapshot();
assert.equal(scheduler.logicalAdmission, "bounded_per_owner_high_water");
assert.ok(Number.isFinite(scheduler.maxActive));
assert.ok(Number.isFinite(scheduler.maxActivePerOwner));
assert.ok(scheduler.maxActive > 0);
assert.ok(scheduler.maxActivePerOwner > 0);
assert.ok(scheduler.maxActivePerOwner <= scheduler.maxActive);

console.log(JSON.stringify({
	ok: true,
	suite: "unlimited-logical-agent-admission",
	owners,
	logicalQueueUnlimited: true,
	physicalMaxActive: scheduler.maxActive,
	physicalMaxActivePerOwner: scheduler.maxActivePerOwner
}, null, 2));
