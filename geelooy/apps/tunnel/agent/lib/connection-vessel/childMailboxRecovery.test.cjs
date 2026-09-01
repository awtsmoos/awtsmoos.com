//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./child-mailbox-recovery.js");

/**
 * @file Proves stale accepted custody remains visible without becoming child-kill authority.
 * @description
 * Awtsmoos.com may observe an old lease, but age cannot prove execution failure or safety to retry.
 * The Awtsmoos renews every instant; this test keeps ambiguity preserved as attention while
 * stronger present-tense watchdog evidence alone decides whether a living child must be replaced.
 */
const now = Date.now();

const acceptedRecords = [record("accepted-1", "accepted_waiting_for_consumer")];
const acceptedMailbox = mailbox(acceptedRecords);
const first = Recovery.reconcileIfStale(acceptedMailbox, {
	reason: "test_child_stale_custody"
});
assert.equal(first.attempted, true);
assert.equal(first.ok, true);
assert.equal(first.attentionRequired, true);
assert.equal(first.replacementRequired, false);
assert.equal(first.safeToRedispatch, false);
assert.equal(first.actions[0].operation, "preserved");
assert.equal(first.actions[0].reason, "accepted_execution_ambiguity");
assert.equal(acceptedRecords.length, 1);

const second = Recovery.reconcileIfStale(acceptedMailbox);
assert.equal(second.attempted, true);
assert.equal(second.attentionRequired, true);
assert.equal(second.replacementRequired, false);
assert.equal(second.actions[0].operation, "preserved");
assert.equal(acceptedRecords.length, 1);

const resultRecords = [record("result-1", "result_waiting_for_ack")];
const result = Recovery.reconcileIfStale(mailbox(resultRecords));
assert.equal(result.attempted, true);
assert.equal(result.ok, true);
assert.equal(result.attentionRequired, true);
assert.equal(result.replacementRequired, false);
assert.equal(result.safeToRedispatch, false);
assert.equal(result.actions[0].operation, "preserved");
assert.equal(result.actions[0].reason, "result_waiting_for_ack");
assert.equal(resultRecords.length, 1);

console.log("BHY custody age remains attention without destructive child replacement");

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
function mailbox(records) {
	return {
		evidence() {
			return { custody: records };
		},
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
