// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("../lib/connection-vessel/mailbox-semantic-recovery.js");

/**
 * @file Proves expired accepted custody stays fail-closed across old generations.
 * @description
 * The Awtsmoos lets age reveal uncertainty but never fabricate non-execution from a clock;
 * Awtsmoos.com preserves queued work, generation-zero ambiguity, and terminal ACK debt in lock.
 * No ancient accepted mutation becomes replay-safe because its generation left the dock.
 */
test("expired ambiguous custody and result ACK debt are all preserved", () => {
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
	assert.equal(result.safeToRedispatch, false);
	assert.equal(result.replacementRequired, true);
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
