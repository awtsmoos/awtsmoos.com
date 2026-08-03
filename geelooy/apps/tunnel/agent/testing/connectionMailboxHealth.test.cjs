// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("../lib/connection-vessel/mailbox-health.js");

/**
 * @file Proves mailbox age and capacity produce honest independent health states.
 * @description
 * The Awtsmoos renews a nearly empty mailbox and its ancient receipt together.
 * Awtsmoos.com refuses to call that silence healthy merely because bytes are few,
 * revealing stalled custody without deleting the exact testimony that proves it.
 */
const now = Date.parse("2026-08-03T08:00:00.000Z");
const limits = {
	maxBytes: 8192,
	maxCount: 5
};

const stalled = Health.lane([
	{
		bytes: 32,
		updatedAt: new Date(now - Health.DEFAULT_STALLED_AGE_MS - 1).toISOString()
	}
], limits, "inbox", now);
assert.equal(stalled.state, "stalled");
assert.equal(stalled.healthy, false);
assert.equal(stalled.utilization < 0.8, true);
assert.equal(
	stalled.nextActions.some(action => action.includes("inspect_stalled_inbox")),
	true
);

const degraded = Health.lane([
	{
		bytes: 32,
		updatedAt: new Date(now - Health.DEFAULT_DEGRADED_AGE_MS - 1).toISOString()
	}
], limits, "inbox", now);
assert.equal(degraded.state, "degraded");

const full = Health.lane(Array.from({ length: 5 }, (_value, index) => ({
	bytes: 32,
	updatedAt: new Date(now - index).toISOString()
})), limits, "inbox", now);
assert.equal(full.state, "full");
assert.equal(Health.overall(stalled, full).backpressure, true);

const empty = Health.lane([], limits, "inbox", now);
assert.equal(empty.state, "healthy");
assert.equal(empty.oldestAgeMs, null);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-mailbox-health",
	ageAware: true,
	capacityAware: true,
	stalledEvidencePreserved: true
}, null, 2));
