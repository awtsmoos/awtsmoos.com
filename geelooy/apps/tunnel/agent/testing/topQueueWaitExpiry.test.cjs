// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");
const Prune = require("../lib/runtime/main-queue-prune.js");

/**
 * @file Proves queue expiry removes only waiting custody and never invents running release.
 * @description
 * The Awtsmoos distinguishes a deed waiting at the gate from one already entrusted;
 * Awtsmoos.com gives that waiting deed an exact name, then expires only its queue vessel as requested.
 */
const lanes = Priority.makeLaneState();
const item = {
	data: {
		id: "queue-expiry-1",
		payload: {
			action: "read",
			kind: "fs",
			logicalAgentId: "queue-agent",
			agentSessionId: "top-queue-expiry-suite",
			generation: 1,
			requestId: "queue-expiry-1"
		}
	},
	enqueuedAt: Date.now() - 100
};
Priority.enqueue(lanes, item);
assert.equal(lanes.p1_fs_light.queue.length, 1);
assert.equal(lanes.p1_fs_light.inflight, 0);

const expired = [];
let cleared = 0;
let wakeCount = 0;
const pruner = Prune.createQueuePruner({
	Limits: { QUEUE_WAIT_TIMEOUT_MS: { p1_fs_light: 1000 } },
	state: { lanes }
}, {
	expired: (...args) => expired.push(args)
}, {
	clear: () => { cleared += 1; }
}, () => { wakeCount += 1; });

pruner.arm(item, "p1_fs_light");
item.queueExpiresAt = Date.now() - 1;
assert.equal(pruner.prune(), 1);
assert.equal(lanes.p1_fs_light.queue.length, 0);
assert.equal(lanes.p1_fs_light.inflight, 0);
assert.equal(lanes.p1_fs_light.requesterInflight.size, 0);
assert.equal(expired.length, 1);
assert.equal(expired[0][0], item);
assert.equal(expired[0][1], "p1_fs_light");
assert.equal(cleared, 1);
assert.equal(item.queueExpiryTimer, null);
assert.equal(wakeCount, 0);
assert.equal(Prune.isExpired(item, Date.now()), true);

console.log(JSON.stringify({
	ok: true,
	suite: "top-queue-wait-expiry"
}, null, 2));
