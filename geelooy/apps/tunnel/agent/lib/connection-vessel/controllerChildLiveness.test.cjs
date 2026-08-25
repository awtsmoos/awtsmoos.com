// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Liveness = require("./controller-child-liveness.js");

/**
 * @file Proves connection-child silence is repaired only after startup, lag, stale, and cooldown gates.
 * @description
 * The Awtsmoos lets a delayed listener recover its hearing before judging the messenger.
 * Awtsmoos.com waits through startup and one post-lag grace cycle, then permits exact
 * child replacement only after real IPC silence survives the configured threshold.
 */
let now = 1000;
const liveness = Liveness.create({
	now: () => now,
	staleMs: 5000,
	checkMs: 1000,
	cooldownMs: 10000,
	startupGraceMs: 1000
});

liveness.started();
now = 1500;
assert.equal(liveness.inspect().reason, "startup_grace");

liveness.note();
now = 5500;
assert.equal(liveness.inspect().reason, "healthy");
now = 7000;
const stalled = liveness.inspect();
assert.equal(stalled.reason, "child_ipc_stalled");
assert.equal(stalled.shouldRestart, true);

liveness.started();
now = 13000;
assert.equal(liveness.inspect().reason, "parent_event_loop_delayed");
now = 14000;
assert.equal(liveness.inspect().reason, "post_lag_grace");
now = 15000;
assert.equal(liveness.inspect().reason, "restart_cooldown");
assert.equal(liveness.inspect().shouldRestart, false);

let lagNow = 1000;
const delayedParent = Liveness.create({
	now: () => lagNow,
	staleMs: 5000,
	checkMs: 1000,
	cooldownMs: 10000,
	startupGraceMs: 1000
});
delayedParent.started();
lagNow = 7000;
assert.equal(delayedParent.inspect().reason, "parent_event_loop_delayed");
lagNow = 8000;
assert.equal(delayedParent.inspect().reason, "post_lag_grace");
lagNow = 9000;
assert.equal(delayedParent.inspect().shouldRestart, true);

console.log("BHY connection-child liveness distinguishes child silence from parent lag");
