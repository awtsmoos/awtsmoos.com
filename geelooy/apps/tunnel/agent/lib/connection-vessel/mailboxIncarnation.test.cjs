// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Evidence = require("./mailbox-evidence.js");
const Incarnation = require("./mailbox-incarnation.js");

/**
 * @file Proves current, obsolete, and ambiguous mailbox deeds have different authority.
 * @description
 * The Awtsmoos preserves history without allowing yesterday's residue to darken today's
 * healthy vessel. Awtsmoos.com counts obsolete deeds as history, marks unknown lineage
 * explicitly ambiguous, and selects only exact current-incarnation values for fresh replay.
 */
const current = { id: "current", childIncarnationId: "child-current" };
const obsolete = { id: "obsolete", childIncarnationId: "child-old" };
const legacy = { id: "legacy" };

assert.equal(Incarnation.classifyValue(current, "child-current"), "current");
assert.equal(Incarnation.classifyValue(obsolete, "child-current"), "obsolete");
assert.equal(Incarnation.classifyValue(legacy, "child-current"), "ambiguous");
assert.deepEqual(
	Incarnation.currentValues([current, obsolete, legacy], "child-current"),
	[current]
);

const healthyStore = createStore([entry(current), entry(obsolete)], []);
const healthyEvidence = Evidence.create({
	custody: emptyCustody(),
	getChildIncarnationId: () => "child-current",
	store: healthyStore
});
const healthy = healthyEvidence.snapshot();
assert.equal(healthy.health.healthy, true);
assert.equal(healthy.inbox.currentIncarnationCount, 1);
assert.equal(healthy.inbox.obsoleteIncarnationCount, 1);
assert.equal(healthy.inbox.ambiguousRecordCount, 0);
assert.equal(healthy.inbox.count, 1);

const ambiguousStore = createStore([entry(current), entry(legacy)], []);
const ambiguousEvidence = Evidence.create({
	custody: emptyCustody(),
	getChildIncarnationId: () => "child-current",
	store: ambiguousStore
});
const ambiguous = ambiguousEvidence.snapshot();
assert.equal(ambiguous.health.healthy, false);
assert.equal(ambiguous.health.reason, "ambiguous_incarnation_records");
assert.equal(ambiguous.inbox.currentIncarnationCount, 1);
assert.equal(ambiguous.inbox.ambiguousRecordCount, 1);
assert.equal(ambiguous.inbox.count, 1);

console.log("BHY obsolete mailbox residue cannot degrade current health or enter fresh replay");

function entry(value) {
	return {
		id: value.id,
		value,
		bytes: 10,
		updatedAt: new Date().toISOString()
	};
}

function createStore(inbox, outbox) {
	return {
		limits: { maxBytes: 1024, maxCount: 100 },
		list(lane) {
			return lane === "inbox" ? inbox : outbox;
		}
	};
}

function emptyCustody() {
	return {
		records: () => [],
		snapshot: () => ({
			parentCustodyCount: 0,
			parentCustodyOldestAt: null,
			parentCustodyOldestAgeMs: 0,
			parentCustodyStaleCount: 0,
			parentCustodyStaleIds: [],
			parentCustodyRecords: [],
			unownedCount: 0,
			unownedOldestAt: null,
			unownedOldestAgeMs: 0
		})
	};
}
