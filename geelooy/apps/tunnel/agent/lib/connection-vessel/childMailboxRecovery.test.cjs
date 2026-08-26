// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./child-mailbox-recovery.js");

/**
 * @file Proves child-local semantic healing removes only safe expired pre-result custody.
 * @description
 * The Awtsmoos lets stale custody leave the hot path without erasing fulfilled testimony.
 * Awtsmoos.com quarantines an expired accepted deed once, never redispatches it, and
 * preserves result-bearing evidence until acknowledgement or generation replacement.
 */
const now = Date.now();
let preResultRecords = [record("accepted-1", "accepted_waiting_for_consumer")];
let quarantines = [];
const preResultMailbox = mailbox(
	() => preResultRecords,
	id => {
		quarantines.push(id);
		preResultRecords = preResultRecords.filter(item => item.id !== id);
		return { ok: true, id };
	}
);

const first = Recovery.reconcileIfStale(preResultMailbox, {
	reason: "test_child_stale_custody"
});
assert.equal(first.attempted, true);
assert.equal(first.ok, true);
assert.equal(first.safeToRedispatch, false);
assert.equal(first.expired, 1);
assert.equal(first.actions[0].operation, "quarantined");
assert.deepEqual(quarantines, ["accepted-1"]);

const second = Recovery.reconcileIfStale(preResultMailbox);
assert.equal(second.attempted, false);
assert.equal(second.reason, "child_mailbox_fresh");
assert.deepEqual(quarantines, ["accepted-1"]);

let resultRecords = [record("result-1", "result_waiting_for_ack")];
let resultQuarantines = 0;
const resultMailbox = mailbox(
	() => resultRecords,
	() => {
		resultQuarantines += 1;
		return { ok: true };
	}
);
const preserved = Recovery.reconcileIfStale(resultMailbox);
assert.equal(preserved.attempted, true);
assert.equal(preserved.ok, false);
assert.equal(preserved.replacementRequired, true);
assert.equal(preserved.actions[0].operation, "preserved");
assert.equal(preserved.actions[0].reason, "result_waiting_for_ack");
assert.equal(resultQuarantines, 0);
assert.equal(resultRecords.length, 1);

console.log("BHY child mailbox quarantines stale pre-result custody and preserves results");

/** Creates one deliberately expired exact-custody record. */
function record(id, phase) {
	return {
		id,
		phase,
		phaseStartedAt: now - 60000,
		leaseExpiresAt: now - 30000,
		resultState: phase.startsWith("result_") ? phase : ""
	};
}

/** Creates the minimum real semantic-recovery mailbox contract for one test universe. */
function mailbox(records, quarantineExact) {
	return {
		evidence() {
			return { custody: records() };
		},
		quarantineExact,
		snapshot() {
			const current = records();
			return {
				inbox: {
					parentCustodyStaleCount: current.length,
					parentCustodyCount: current.length
				}
			};
		}
	};
}
