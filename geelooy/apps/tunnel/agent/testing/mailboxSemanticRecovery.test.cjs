// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../lib/connection-vessel/mailbox-semantic-recovery.js");

/**
 * @file Proves expired accepted custody creates attention without destructive authority.
 * @description
 * The Awtsmoos lets an old clock reveal uncertainty but never invent non-execution;
 * Awtsmoos.com preserves queued ambiguity and terminal ACK debt without killing a
 * living child, quarantining accepted work, or making the deed safe to redispatch.
 */
test("expired ambiguous custody and result ACK debt are preserved without replacement", () => {
	const quarantined = [];
	const records = [
		{ id: "queued-A", phase: "queued", generation: 7, leaseExpiresAt: 1 },
		{
			id: "generation-zero",
			phase: "accepted_waiting_for_consumer",
			generation: 0,
			leaseExpiresAt: 1
		},
		{ id: "result-B", phase: "result_waiting_for_ack", generation: 7, leaseExpiresAt: 1 }
	];
	const mailbox = {
		evidence: () => ({ custody: records }),
		quarantineExact: (id, reason) => {
			quarantined.push({ id, reason });
			return { moved: false, preserved: true, safeToRedispatch: false, id, reason };
		},
		snapshot: () => ({ inbox: { parentCustodyCount: 3 } })
	};
	const result = Recovery.reconcile(mailbox, {
		now: Date.now(),
		reason: "test"
	});

	assert.deepEqual(quarantined, []);
	assert.equal(result.ok, true);
	assert.equal(result.attentionRequired, true);
	assert.equal(result.replacementRequired, false);
	assert.equal(result.safeToRedispatch, false);
	assert.equal(result.expired, 3);
	assertAmbiguous(result, "queued-A");
	assertAmbiguous(result, "generation-zero");

	const terminal = result.actions.find(action => action.id === "result-B");
	assert.equal(terminal.operation, "preserved");
	assert.equal(terminal.reason, "result_waiting_for_ack");
	assert.equal(terminal.safeToRedispatch, false);
});

function assertAmbiguous(result, id) {
	const action = result.actions.find(item => item.id === id);
	assert.equal(action.operation, "preserved");
	assert.equal(action.reason, "accepted_execution_ambiguity");
	assert.equal(action.safeToRedispatch, false);
}
