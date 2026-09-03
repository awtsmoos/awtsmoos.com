// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Evidence = require("./mailbox-evidence.js");

/**
 * @file Guards the raw/effective/incarnation mailbox merge that once broke candidate startup.
 * @description
 * The Awtsmoos keeps raw parchment, living custody, and lineage in one truthful ray;
 * Awtsmoos.com refuses a merge where `rawInbox` is named but never born into the day.
 * One injected clock must govern every witness, while ambiguous ancestry still darkens the way.
 */
const currentIncarnationId = "child-current";
let observedAt = 1_000_000;
const currentEntry = entry("current", currentIncarnationId, 900_000);
const ambiguousEntry = entry("ambiguous", "", 999_900);

const healthyEvidence = Evidence.create({
	custody: custody("current", 999_500),
	getChildIncarnationId: () => currentIncarnationId,
	now: () => observedAt,
	store: store([currentEntry], [])
});
const healthy = healthyEvidence.snapshot();

assert.ok(healthy.rawInbox);
assert.equal(healthy.rawInbox.count, 1);
assert.equal(healthy.rawInbox.oldestAgeMs, 100_000);
assert.equal(healthy.inbox.parentCustodyOldestAgeMs, 500);
assert.equal(healthy.inbox.custodyRefreshedCount, 1);
assert.equal(healthy.inbox.currentIncarnationCount, 1);
assert.equal(healthy.health.healthy, true);

const ambiguousEvidence = Evidence.create({
	custody: custody("current", observedAt),
	getChildIncarnationId: () => currentIncarnationId,
	now: () => observedAt,
	store: store([currentEntry, ambiguousEntry], [])
});
const ambiguous = ambiguousEvidence.snapshot();

assert.ok(ambiguous.rawInbox);
assert.equal(ambiguous.rawInbox.count, 1);
assert.equal(ambiguous.inbox.ambiguousRecordCount, 1);
assert.equal(ambiguous.health.healthy, false);
assert.equal(ambiguous.health.reason, "ambiguous_incarnation_records");

console.log(JSON.stringify({
	ok: true,
	rawInboxPresent: true,
	injectedClockPreserved: true,
	ambiguousLineageDegrades: true
}, null, 2));

function entry(id, childIncarnationId, updatedAt) {
	return {
		id,
		bytes: 10,
		updatedAt: new Date(updatedAt).toISOString(),
		value: childIncarnationId ? { id, childIncarnationId } : { id }
	};
}

function store(inbox, outbox) {
	return {
		limits: { maxBytes: 1024, maxCount: 100 },
		list(lane) {
			return lane === "inbox" ? inbox : outbox;
		}
	};
}

function custody(id, progressAt) {
	const record = {
		id,
		acceptedAt: progressAt,
		lastProgressAt: progressAt,
		phaseStartedAt: progressAt
	};
	return {
		records: () => [record],
		snapshot(at) {
			return {
				parentCustodyCount: 1,
				parentCustodyOldestAt: progressAt,
				parentCustodyOldestAgeMs: Math.max(0, at - progressAt),
				parentCustodyStaleCount: 0,
				parentCustodyStaleIds: [],
				parentCustodyRecords: [record],
				unownedCount: 0,
				unownedOldestAt: null,
				unownedOldestAgeMs: 0
			};
		}
	};
}
