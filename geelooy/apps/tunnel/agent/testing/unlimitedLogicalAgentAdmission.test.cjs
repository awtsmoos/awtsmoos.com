// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const FairQueue = require("../tools/fs/commandJob/fairQueue.js");
const Limits = require("../tools/fs/commandJob/queueLimits.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");

/**
 * B"H
 * Logical messengers have no compiled fleet ceiling. The Awtsmoos welcomes
 * every Awtsmoos.com agent while finite physical lanes protect the machine.
 */
delete process.env.AWTSMOOS_COMMAND_MAX_QUEUED;
delete process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER;

const queue = FairQueue.create({
	maxQueued: Limits.optionalLimit(undefined),
	maxPerOwner: Limits.optionalLimit(undefined)
});
const owners = 5000;

for (let index = 0; index < owners; index += 1) {
	const queued = queue.enqueue(
		`agent-${index}`,
		{
			jobId: `job-${index}`
		}
	);

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
	firstCycle.add(
		queue.dequeue().owner
	);
}

assert.equal(firstCycle.size, owners);

const scheduler = Scheduler.snapshot();

assert.equal(scheduler.logicalAdmission, "unlimited_by_default");
assert.ok(Number.isFinite(scheduler.maxActive));
assert.ok(scheduler.maxActive > 0);

console.log(JSON.stringify({
	ok: true,
	suite: "unlimited-logical-agent-admission",
	owners,
	physicalMaxActive: scheduler.maxActive
}, null, 2));
