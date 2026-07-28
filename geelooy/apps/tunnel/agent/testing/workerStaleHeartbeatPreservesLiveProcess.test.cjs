// B"H

const assert = require("node:assert/strict");
const Deadline = require("../lib/runtime/worker-reap-deadline.js");

const now = Date.now();
const worker = {
	state: "running",
	heartbeatAt: new Date(now - 60000).toISOString(),
	deadlineAt: new Date(now + 60000).toISOString()
};
const safe = Deadline.expiration(worker, { now, staleMs: 45000 });
assert.equal(safe.expired, false);
assert.equal(safe.degraded, true);
assert.equal(safe.reason, "worker_heartbeat_stale_unverified");

const explicitlyUnsafe = Deadline.expiration(worker, {
	now,
	staleMs: 45000,
	reapStaleHeartbeat: true
});
assert.equal(explicitlyUnsafe.expired, true);
assert.equal(explicitlyUnsafe.reason, "worker_heartbeat_stale");

console.log(JSON.stringify({
	ok: true,
	suite: "worker-stale-heartbeat-preserves-live-process",
	defaultIsObservationOnly: true
}));
