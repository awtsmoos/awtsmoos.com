// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createRegistry } = require("../lib/runtime/worker-registry.js");

/**
 * B"H
 * Reap claims release active ownership immediately, private control never leaks,
 * and delayed completion cannot rewrite or recount the first terminal ending.
 */
const registry = createRegistry({
	maxActive: 5,
	maxRecent: 5
});
let reapCalls = 0;
registry.registerWorker({
	workerId: "worker-one",
	jobId: "job-one",
	state: "running",
	startedAt: "2026-07-14T00:00:00.000Z",
	heartbeatAt: "2026-07-14T00:00:01.000Z",
	deadlineAt: "2026-07-14T00:00:02.000Z"
}, {
	reap() {
		reapCalls += 1;
	}
});

assert.equal(registry.status().activeTotal, 1);
assert.equal(registry.status().active["worker-one"].reap, undefined);
const claim = registry.claimReap("worker-one", {
	reapReason: "test_deadline"
});
assert.equal(claim.claimed, true);
assert.equal(typeof claim.control.reap, "function");
assert.equal(registry.status().activeTotal, 0);
assert.equal(registry.status().recent[0].state, "reaping");
claim.control.reap();
assert.equal(reapCalls, 1);

registry.finishWorker("worker-one", {
	state: "timed_out",
	reaped: true,
	cleanup: {
		state: "group_dead"
	}
});
let status = registry.status();
assert.equal(status.recentFailed, 1);
assert.equal(status.recentReaped, 1);
assert.equal(status.recent[0].state, "timed_out");

registry.finishWorker("worker-one", {
	state: "completed",
	exitCode: 0,
	lateClose: true
});
status = registry.status();
assert.equal(status.recentFailed, 1);
assert.equal(status.recentCompleted, 0);
assert.equal(status.recentReaped, 1);
assert.equal(status.recent[0].state, "timed_out");
assert.equal(status.recent[0].exitCode, 0);

const duplicate = registry.claimReap("worker-one", {
	reapReason: "duplicate"
});
assert.equal(duplicate.claimed, false);
assert.equal(duplicate.record.state, "timed_out");

console.log(JSON.stringify({
	ok: true,
	suite: "worker-registry-exact-once",
	activeReleasedBeforeCleanup: true,
	terminalStateSealed: true,
	countedOnce: true
}, null, 2));
