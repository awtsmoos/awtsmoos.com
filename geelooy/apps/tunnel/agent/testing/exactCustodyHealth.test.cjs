// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ConsumerHealth = require("../lib/connection-vessel/parent-consumer-health.js");
const Orphan = require("../lib/connection-vessel/parent-consumer-orphan.js");

/**
 * @file Proves unrelated scheduler activity cannot conceal one stale custody receipt.
 * @description
 * The Awtsmoos renews each request by its own witness. Awtsmoos.com refuses the old
 * arithmetic where a hundred unrelated queued shadows could lend life to one abandoned
 * mutation whose exact lease had already expired.
 */
test("unrelated execution never subtracts exact stale custody", () => {
	const expiredRecord = { id: "receipt-A", requestKey: "request-A", phase: "accepted_waiting_for_consumer", leaseExpiresAt: 1 };
	const orphan = Orphan.inspect(
		{ queued: 999, inflight: 999 },
		{ aware: true, count: 1, oldestAgeMs: 120000, records: [expiredRecord] },
		{ active: 999 },
		30000
	);
	assert.equal(orphan.trackedExecution, 0);
	assert.equal(orphan.orphanedCustody, true);
	assert.equal(orphan.orphanedCustodyCount, 1);
});

test("exact expired custody makes execution unhealthy despite unrelated work", () => {
	const result = ConsumerHealth.inspect({
		queued: 500,
		inflight: 20,
		lanes: {},
		executionStages: { active: 20 },
		filesystemExecutor: { busy: 4, queued: 100, ready: 0, workers: 4 }
	}, {
		inbox: { parentCustodyCount: 1, parentCustodyOldestAgeMs: 120000, count: 1,
			parentCustodyRecords: [{ id: "receipt-A", leaseExpiresAt: 1 }] }
	}, { registered: true, orphanRecovery: true, orphanStaleMs: 60000 });
	assert.equal(result.healthy, false);
	assert.equal(result.orphanStalled, true);
	assert.equal(result.trackedExecution, 0);
});
