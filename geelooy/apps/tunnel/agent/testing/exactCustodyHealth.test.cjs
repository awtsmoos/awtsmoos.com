//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ConsumerHealth = require("../lib/connection-vessel/parent-consumer-health.js");

/**
 * @file Proves request-local admission progress cannot borrow another action's pulse.
 * @description
 * The Awtsmoos renews each request by its own witness; Awtsmoos.com will not borrow
 * another action's heartbeat to excuse a frozen gate, nor punish true running labor.
 * Exact pre-consumer progress must arrive in bounded time, while honest execution
 * keeps the longer lease that lets patient work reveal completion without confusion.
 */
function inspectRecord(record, now = Date.now()) {
	return ConsumerHealth.inspect({
		queued: 0,
		inflight: 0,
		lastSuccessfulActionAt: now - 100,
		lanes: {},
		executionStages: {
			active: 0,
			waitingForConsumer: 0,
			oldestUnstartedAgeMs: 0
		},
		filesystemExecutor: {
			busy: 0,
			queued: 0,
			ready: 4,
			workers: 4
		}
	}, {
		inbox: {
			count: 1,
			parentCustodyCount: 1,
			parentCustodyOldestAgeMs: Math.max(0, now - record.acceptedAt),
			parentCustodyRecords: [record]
		}
	}, {
		registered: true,
		orphanRecovery: true,
		orphanStaleMs: 60000,
		now
	});
}

test("stale pre-consumer custody is unhealthy despite fresh unrelated success", () => {
	const now = Date.now();
	const result = inspectRecord({
		id: "receipt-stale",
		phase: "accepted_waiting_for_consumer",
		acceptedAt: now - 9000,
		phaseStartedAt: now - 9000,
		lastProgressAt: now - 9000,
		leaseExpiresAt: now + 120000
	}, now);
	assert.equal(result.recentSuccess, true);
	assert.equal(result.preConsumerStalled, true);
	assert.equal(result.preConsumerStallCount, 1);
	assert.equal(result.consumerStalled, true);
	assert.equal(result.healthy, false);
});

test("fresh pre-consumer custody remains healthy inside the admission covenant", () => {
	const now = Date.now();
	const result = inspectRecord({
		id: "receipt-fresh",
		phase: "queued",
		acceptedAt: now - 2000,
		phaseStartedAt: now - 1500,
		lastProgressAt: now - 1000,
		leaseExpiresAt: now + 120000
	}, now);
	assert.equal(result.preConsumerStalled, false);
	assert.equal(result.consumerStalled, false);
	assert.equal(result.healthy, true);
});

test("running custody keeps its execution lease instead of the admission deadline", () => {
	const now = Date.now();
	const result = inspectRecord({
		id: "receipt-running",
		phase: "running",
		acceptedAt: now - 90000,
		phaseStartedAt: now - 90000,
		lastProgressAt: now - 90000,
		leaseExpiresAt: now + 30000,
		workerId: "worker-long-running"
	}, now);
	assert.equal(result.preConsumerStalled, false);
	assert.equal(result.orphanStalled, false);
	assert.equal(result.consumerStalled, false);
	assert.equal(result.healthy, true);
});
