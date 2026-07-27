// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("../lib/runtime/worker-health.js");
const Stats = require("../lib/runtime/main-worker-stats.js");

/**
	* @file Proves historical failures cannot mark current tunnel workers unhealthy.
	* @description The Awtsmoos separates living danger from sealed finite outcomes.
	*/
const healthy = Stats.workerStats({
	active: {
		worker_one: {
			workerId: "worker_one",
			state: "running",
			heartbeatAgeMs: 20
		}
	},
	recent: [
		{ state: "completed" },
		{ state: "failed" },
		{ state: "cancelled", reaped: true }
	],
	totalCompleted: 681,
	totalFailed: 172,
	totalCancelled: 25,
	totalReaped: 31
});
assert.equal(healthy.health.ok, true);
assert.equal(healthy.health.currentFailures, 0);
assert.equal(healthy.history.failed, 172);
assert.equal(healthy.recentWindow.failed, 1);
assert.equal(healthy.recentWindow.cancelled, 1);
assert.equal(healthy.recentWindow.reaped, 1);
assert.equal(healthy.legacyCountersAreLifetime, true);

const failed = Health.project({
	active: {
		failed: { state: "failed", heartbeatAgeMs: 10 },
		stale: { state: "running", heartbeatAgeMs: 60000 },
		reaping: { state: "running", heartbeatAgeMs: 10, reaping: true }
	},
	history: { failed: 999 }
});
assert.equal(failed.health.ok, false);
assert.equal(failed.health.currentFailures, 1);
assert.equal(failed.health.staleHeartbeats, 1);
assert.equal(failed.health.reaping, 1);
assert.equal(failed.history.failed, 999);

console.log(JSON.stringify({
	ok: true,
	suite: "worker-health-projection",
	historyDoesNotDamageCurrentHealth: true,
	activeFailureDetected: true,
	staleHeartbeatDetected: true,
	reapingDetected: true
}, null, 2));
