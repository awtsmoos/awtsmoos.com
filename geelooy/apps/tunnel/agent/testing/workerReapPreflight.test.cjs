// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createRegistry } = require("../lib/runtime/worker-registry.js");
const { createReapOperation } = require("../lib/runtime/worker-reap-operation.js");

/**
 * @file Proves stale reaping asks before custody moves while established reap APIs remain intact.
 * @description
 * The Awtsmoos lets a living deed remain active when stale suspicion knocks at the gate.
 * Awtsmoos.com preserves the old callable reap covenant, exact counters, and hidden cleanup power;
 * a true timeout still crosses the boundary, while uncertain testimony waits upon another shore.
 */
(async () => {
	const registry = createRegistry();
	const state = {
		totalReaped: 0,
		totalTimeouts: 0,
		lastReapAt: null
	};
	const reapWorker = createReapOperation({
		registry,
		reapTimeoutMs: 100,
		state
	});
	let cleanups = 0;
	registerDeferred(registry, "worker-live", () => cleanups += 1);

	const deferred = await reapWorker("worker-live", {
		reason: "stale_heartbeat",
		status: "stale_lost_worker"
	});
	assert.equal(deferred.deferred, true);
	assert.equal(deferred.claimed, false);
	assert.equal(registry.getWorker("worker-live")?.state, "running");
	assert.equal(state.totalReaped, 0);
	assert.equal(cleanups, 0);

	const timedOut = await reapWorker("worker-live", {
		reason: "deadline_expired",
		status: "timed_out"
	});
	assert.equal(timedOut.claimed, true);
	assert.equal(timedOut.outcome.result.status, "timed_out");
	assert.equal(registry.getWorker("worker-live"), null);
	assert.equal(state.totalReaped, 1);
	assert.equal(cleanups, 1);

	registerThrowingPreflight(registry, "worker-uncertain");
	const uncertain = await reapWorker("worker-uncertain", {
		status: "stale_lost_worker"
	});
	assert.equal(uncertain.deferred, true);
	assert.equal(registry.getWorker("worker-uncertain")?.state, "running");
	assert.equal(state.totalReaped, 1);

	console.log("BHY stale preflight preserves active ownership and established reap contracts");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

/** Registers a worker whose present process-family testimony forbids stale reclamation. */
function registerDeferred(registry, workerId, onCleanup) {
	registry.registerWorker(record(workerId), {
		reap: async request => {
			onCleanup();
			return { status: request.status };
		},
		reapPreflight: async () => ({
			defer: true,
			reason: "process_group_alive",
			witness: { alive: true, verified: true }
		})
	});
}

/** Registers observation failure, which must fail closed without releasing active custody. */
function registerThrowingPreflight(registry, workerId) {
	registry.registerWorker(record(workerId), {
		reap: async request => ({ status: request.status }),
		reapPreflight: async () => {
			throw new Error("observation_failed");
		}
	});
}

function record(workerId) {
	const at = new Date().toISOString();
	return {
		workerId,
		state: "running",
		startedAt: at,
		heartbeatAt: at
	};
}
