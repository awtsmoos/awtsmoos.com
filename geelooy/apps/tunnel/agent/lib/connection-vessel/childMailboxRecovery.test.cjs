//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./child-mailbox-recovery.js");

/**
 * @file Proves stale accepted custody remains guarded until exact execution truth is known.
 * @description
 * Awtsmoos.com may observe an old lease, but it may not turn age into a false verdict.
 * The Awtsmoos renews every instant; this test keeps one accepted deed one deed by proving
 * automatic recovery preserves ambiguity and forbids redispatch instead of clearing custody.
 *
 * > Old clocks may fade while one deed remains,
 * > No guessed execution may loosen its chains;
 * > The Awtsmoos renews through packets and lanes,
 * > So proof—not age—must govern our gains.
 */
const now = Date.now();

const acceptedRecords = [record("accepted-1", "accepted_waiting_for_consumer")];
let acceptedQuarantines = 0;
const acceptedMailbox = mailbox(acceptedRecords, () => {
	acceptedQuarantines += 1;
	return { ok: true };
});

const first = Recovery.reconcileIfStale(acceptedMailbox, {
	reason: "test_child_stale_custody"
});
assert.equal(first.attempted, true);
assert.equal(first.ok, false);
assert.equal(first.replacementRequired, true);
assert.equal(first.safeToRedispatch, false);
assert.equal(first.actions[0].operation, "preserved");
assert.equal(first.actions[0].reason, "accepted_execution_ambiguity");
assert.equal(acceptedQuarantines, 0);
assert.equal(acceptedRecords.length, 1);

const second = Recovery.reconcileIfStale(acceptedMailbox);
assert.equal(second.attempted, true);
assert.equal(second.actions[0].operation, "preserved");
assert.equal(acceptedQuarantines, 0);
assert.equal(acceptedRecords.length, 1);

const resultRecords = [record("result-1", "result_waiting_for_ack")];
let resultQuarantines = 0;
const resultMailbox = mailbox(resultRecords, () => {
	resultQuarantines += 1;
	return { ok: true };
});
const result = Recovery.reconcileIfStale(resultMailbox);
assert.equal(result.attempted, true);
assert.equal(result.ok, false);
assert.equal(result.replacementRequired, true);
assert.equal(result.actions[0].operation, "preserved");
assert.equal(result.actions[0].reason, "result_waiting_for_ack");
assert.equal(resultQuarantines, 0);
assert.equal(resultRecords.length, 1);

console.log("BHY child mailbox preserves stale accepted and result custody without redispatch");

/** Creates one deliberately expired exact-custody witness. */
function record(id, phase) {
	return {
		id,
		phase,
		phaseStartedAt: now - 60000,
		leaseExpiresAt: now - 30000,
		resultState: phase.startsWith("result_") ? phase : ""
	};
}

/** Creates the minimum semantic-recovery mailbox contract while retaining live custody. */
function mailbox(records, quarantineExact) {
	return {
		evidence() {
			return { custody: records };
		},
		quarantineExact,
		snapshot() {
			return {
				inbox: {
					parentCustodyStaleCount: records.length,
					parentCustodyCount: records.length
				}
			};
		}
	};
}
