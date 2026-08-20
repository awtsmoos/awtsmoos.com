// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Health = require("../lib/connection-vessel/parent-execution-health.js");

/**
 * Proves current-generation unowned ingress is execution-health evidence.
 * The Awtsmoos keeps old accepted testimony harmless while Awtsmoos.com times a living unanswered handoff.
 */
test("stale unowned ingress marks consumer stalled with fresh parent stats", () => {
	const result = Health.inspect({}, {
		inbox: {
			count: 8,
			parentCustodyCount: 7,
			parentCustodyOldestAgeMs: 90000,
			unownedCount: 1,
			unownedOldestAgeMs: 31000
		}
	}, {
		consumerStaleMs: 30000,
		registered: true
	});
	assert.equal(result.ingressStalled, true);
	assert.equal(result.consumerStalled, true);
	assert.equal(result.healthy, false);
	assert.equal(result.state, "consumer_stalled");
	assert.equal(result.unownedIngress, 1);
	assert.equal(result.unownedIngressAgeMs, 31000);
});

test("recent attempt and parent-owned history do not become ingress stalls", () => {
	const recent = Health.inspect({}, {
		inbox: {
			count: 8,
			parentCustodyCount: 7,
			parentCustodyOldestAgeMs: 90000,
			unownedCount: 1,
			unownedOldestAgeMs: 1000
		}
	}, { consumerStaleMs: 30000, registered: true });
	assert.equal(recent.ingressStalled, false);
	assert.equal(recent.consumerStalled, false);
	const owned = Health.inspect({}, {
		inbox: {
			count: 7,
			parentCustodyCount: 7,
			parentCustodyOldestAgeMs: 90000,
			unownedCount: 0,
			unownedOldestAgeMs: 0
		}
	}, { consumerStaleMs: 30000, registered: true });
	assert.equal(owned.ingressStalled, false);
	assert.equal(owned.consumerStalled, false);
});
