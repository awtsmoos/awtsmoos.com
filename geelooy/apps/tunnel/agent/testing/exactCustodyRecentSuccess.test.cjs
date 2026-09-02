// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Health = require("../lib/connection-vessel/parent-consumer-health.js");

/**
 * @file Proves unrelated recent success is telemetry, never custody ownership.
 * @description
 * The Awtsmoos renews each deed by its own witness. Awtsmoos.com refuses to lend one
 * successful request's light to another request whose exact custody lease has expired.
 * Named regression for the exact-health STABILITY COVENANT.
 */
test("recent unrelated success cannot grace expired exact custody", () => {
	const result = Health.inspect({
		lastSuccessfulActionAt: Date.now(),
		lanes: {},
		executionStages: { active: 0, waitingForConsumer: 0 },
		filesystemExecutor: { busy: 0, queued: 0, ready: 4, workers: 4 }
	}, {
		inbox: {
			count: 1,
			parentCustodyCount: 1,
			parentCustodyOldestAgeMs: 120000,
			parentCustodyRecords: [{
				id: "stale-receipt",
				requestKey: "stale-request",
				leaseExpiresAt: 1
			}]
		}
	}, { registered: true, orphanRecovery: true, orphanStaleMs: 60000 });

	assert.equal(result.recentSuccess, true);
	assert.equal(result.orphanedCustody, true);
	assert.equal(result.degradedCustody, true);
	assert.equal(result.consumerStalled, true);
	assert.equal(result.healthy, false);
});
