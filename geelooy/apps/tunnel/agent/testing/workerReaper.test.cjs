// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createRegistry } = require("../lib/runtime/worker-registry.js");
const { createWorkerReaper } = require("../lib/runtime/worker-reaper.js");

/**
 * B"H
 * Deadlines outrank synthetic heartbeats, fresh workers survive, and a callback
 * that never settles cannot retain active registry ownership.
 */
async function main() {
	const now = Date.parse("2026-07-14T05:00:00.000Z");
	const registry = createRegistry();
	const reaper = createWorkerReaper(registry, {
		now,
		staleMs: 5000,
		deadlineGraceMs: 10,
		reapTimeoutMs: 30,
		intervalMs: 1000
	});

	registry.registerWorker(worker("deadline", {
		heartbeatAt: new Date(now).toISOString(),
		deadlineAt: new Date(now - 1000).toISOString()
	}), {
		async reap(request) {
			return {
				status: request.status,
				cleanup: { state: "group_dead" }
			};
		}
	});
	await reaper.tick();
	let status = registry.status();
	assert.equal(status.activeTotal, 0);
	assert.equal(status.recent[0].state, "timed_out");
	assert.equal(status.recentReaped, 1);

	registry.registerWorker(worker("fresh", {
		heartbeatAt: new Date(now).toISOString(),
		deadlineAt: new Date(now + 60000).toISOString()
	}), {
		reap() {
			throw new Error("fresh_worker_should_not_reap");
		}
	});
	await reaper.tick();
	assert.equal(registry.status().activeTotal, 1);

	registry.registerWorker(worker("wedged", {
		heartbeatAt: new Date(now - 60000).toISOString(),
		deadlineAt: new Date(now + 60000).toISOString()
	}), {
		reap() {
			return new Promise(() => {});
		}
	});
	const pending = reaper.reapWorker("worker-wedged", {
		reason: "manual_stale_test",
		status: "stale_lost_worker"
	});
	assert.equal(registry.status().activeTotal, 1);
	const result = await pending;
	assert.equal(result.outcome.timedOut, true);
	status = registry.status();
	assert.equal(status.activeTotal, 1);
	assert.equal(status.recent[0].state, "cleanup_failed");
	assert.equal(reaper.status().totalTimeouts, 1);

	console.log(JSON.stringify({
		ok: true,
		suite: "worker-reaper",
		deadlineBeatsHeartbeat: true,
		freshWorkerPreserved: true,
		wedgedCleanupReleasedImmediately: true,
		reapCallbackTimeouts: reaper.status().totalTimeouts
	}, null, 2));
}

function worker(id, patch) {
	return {
		workerId: `worker-${id}`,
		jobId: `job-${id}`,
		state: "running",
		startedAt: "2026-07-14T04:00:00.000Z",
		...patch
	};
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
