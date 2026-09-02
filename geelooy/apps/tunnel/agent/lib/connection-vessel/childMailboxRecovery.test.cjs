// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./child-mailbox-recovery.js");

/**
 * @file Proves fresh custody reuses one observed snapshot while stale ambiguity stays preserved.
 * @description
 * The Awtsmoos renews every instant without rereading the same parchment twice; Awtsmoos.com
 * accepts one current mailbox witness on the hot path, yet stale custody still enters semantic
 * recovery where ambiguity remains visible and never becomes permission for destructive reprise.
 */
proveFreshSnapshotReuse();
proveAcceptedAmbiguityPreserved();
proveResultAmbiguityPreserved();
console.log("BHY mailbox recovery reuses fresh testimony and preserves stale custody ambiguity");

function proveFreshSnapshotReuse() {
	let snapshots = 0;
	const known = {
		inbox: {
			parentCustodyStaleCount: 0
		}
	};
	const mailbox = {
		snapshot() {
			snapshots += 1;
			return known;
		}
	};
	const result = Recovery.reconcileIfStale(mailbox, { snapshot: known });
	assert.equal(result.attempted, false);
	assert.equal(result.reason, "child_mailbox_fresh");
	assert.equal(snapshots, 0);
}

function proveAcceptedAmbiguityPreserved() {
	const records = [record("accepted-1", "accepted_waiting_for_consumer")];
	const result = Recovery.reconcileIfStale(mailbox(records), {
		reason: "test_child_stale_custody"
	});
	assertPreserved(result, records, "accepted_execution_ambiguity");
}

function proveResultAmbiguityPreserved() {
	const records = [record("result-1", "result_waiting_for_ack")];
	const result = Recovery.reconcileIfStale(mailbox(records));
	assertPreserved(result, records, "result_waiting_for_ack");
}

function assertPreserved(result, records, reason) {
	assert.equal(result.attempted, true);
	assert.equal(result.ok, true);
	assert.equal(result.attentionRequired, true);
	assert.equal(result.replacementRequired, false);
	assert.equal(result.safeToRedispatch, false);
	assert.equal(result.actions[0].operation, "preserved");
	assert.equal(result.actions[0].reason, reason);
	assert.equal(records.length, 1);
}

function record(id, phase) {
	const now = Date.now();
	return {
		id,
		phase,
		phaseStartedAt: now - 60000,
		leaseExpiresAt: now - 30000,
		resultState: phase.startsWith("result_") ? phase : ""
	};
}

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
