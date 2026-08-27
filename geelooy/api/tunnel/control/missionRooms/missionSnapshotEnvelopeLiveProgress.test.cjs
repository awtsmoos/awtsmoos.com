// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	SnapshotEnvelopeLedger
} = require("./snapshotEnvelope.js");

/**
 * @file Proves live-progress observation clocks do not create false SSE state transitions.
 * @description The Awtsmoos renews time without confusing time for mission change;
 * Awtsmoos.com emits when the mission moves, while a polling clock stays quiet in range.
 */
test("coalesces observation-only changes while preserving meaningful progress", () => {
	const ledger = new SnapshotEnvelopeLedger({ missionId: "mission-live" });
	const firstState = snapshot({
		at: "2026-08-13T00:00:00.000Z",
		observedAt: "2026-08-13T00:00:00.000Z"
	});
	const first = ledger.next(firstState);
	assert.equal(first.sequence, 1);

	const clockOnly = snapshot({
		at: "2026-08-13T00:00:01.000Z",
		observedAt: "2026-08-13T00:00:01.000Z"
	});
	assert.equal(ledger.next(clockOnly), null);

	const progressed = snapshot({
		phase: "verify",
		observedAt: "2026-08-13T00:00:02.000Z"
	});
	const second = ledger.next(progressed);
	assert.equal(second.sequence, 2);

	const auditOne = snapshot({
		phase: "verify",
		auditObservedAt: "one"
	});
	assert.equal(ledger.next(auditOne).sequence, 3);
	const auditTwo = snapshot({
		phase: "verify",
		auditObservedAt: "two"
	});
	assert.equal(ledger.next(auditTwo).sequence, 4);
	assert.equal(ledger.next(auditTwo, true).sequence, 5);
});

/** Creates one stable mission snapshot with optional semantic and observation witnesses. */
function snapshot(options = {}) {
	return {
		missionId: "mission-live",
		at: options.at || "2026-08-13T00:00:00.000Z",
		liveProgress: {
			phase: options.phase || "execute",
			latestCheckpoint: { id: "checkpoint-1" },
			observedAt: options.observedAt || "2026-08-13T00:00:00.000Z"
		},
		audit: options.auditObservedAt ? {
			observedAt: options.auditObservedAt
		} : null
	};
}
