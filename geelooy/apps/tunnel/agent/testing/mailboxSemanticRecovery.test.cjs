// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../lib/connection-vessel/mailbox-semantic-recovery.js");

/**
 * @file Proves stale custody heals without replaying accepted mutations or losing results.
 * @description
 * The Awtsmoos preserves a completed deed while stale pre-result custody may leave the
 * hot lane. Awtsmoos.com quarantines exact expired execution receipts, never marks them
 * replay-safe, and preserves any result still waiting for its acknowledgement witness.
 */
test("pre-result stale custody quarantines while result-waiting-ack is preserved", () => {
	const quarantined = [];
	const records = [
		{ id: "queued-A", phase: "queued", leaseExpiresAt: 1 },
		{ id: "result-B", phase: "result_waiting_for_ack", leaseExpiresAt: 1 }
	];
	const mailbox = {
		evidence: () => ({ custody: records }),
		quarantineExact: (id, reason) => {
			quarantined.push({ id, reason });
			return { moved: true, id, reason };
		},
		snapshot: () => ({ inbox: { parentCustodyCount: 1 } })
	};
	const result = Recovery.reconcile(mailbox, { now: Date.now(), reason: "test" });
	assert.deepEqual(quarantined.map(item => item.id), ["queued-A"]);
	assert.equal(result.safeToRedispatch, false);
	assert.equal(result.replacementRequired, true);
	const preserved = result.actions.find(action => action.id === "result-B");
	assert.equal(preserved.operation, "preserved");
	assert.equal(preserved.safeToRedispatch, false);
});
