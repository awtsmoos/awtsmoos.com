// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Proves recent hard lag parks work while a quiet sample cannot erase pressure.
 * @description Control survives every pressure level; accepted bulk work waits for
 * rolling evidence to clear instead of failing before its mutation reaches the Mac.
 */
const limits = {
	...Circuit.DEFAULTS,
	softLagMs: 500,
	hardLagMs: 2000,
	panicLagMs: 5000,
	advisoryOnly: false
};

const hard = context(5, 3000);
assert.equal(Circuit.snapshot(hard, limits).level, "hard");
assert.equal(Circuit.snapshot(hard, limits).pressureLagMs, 3000);
assert.equal(Circuit.canAccept("p0_control", hard, limits).startAllowed, true);
assert.equal(Circuit.canAccept("p0_wait", hard, limits).startAllowed, true);
for (const lane of ["p1_fs_light", "p2_chrome_light", "p3_heavy", "p4_bulk"]) {
	const result = Circuit.canAccept(lane, hard, limits);
	assert.equal(result.ok, true);
	assert.equal(result.deferred, true);
	assert.equal(result.startAllowed, false);
	assert.equal(result.reason, "deferred_by_event_loop_pressure");
}

const soft = context(5, 600);
assert.equal(Circuit.snapshot(soft, limits).level, "soft");
assert.equal(Circuit.canAccept("p1_fs_light", soft, limits).startAllowed, true);
assert.equal(Circuit.canAccept("p4_bulk", soft, limits).startAllowed, true);

const saturatedSoft = context(5, 600, limits.p4QueueLimit);
assert.equal(Circuit.canAccept("p4_bulk", saturatedSoft, limits).ok, false);
assert.equal(Circuit.canAccept("p4_bulk", saturatedSoft, limits).blockingReason, "p4_backpressure");

const panic = context(5, 6000);
assert.equal(Circuit.snapshot(panic, limits).level, "panic");
assert.equal(Circuit.canAccept("p3_heavy", panic, limits).deferred, true);

const clear = context(5, 40);
assert.equal(Circuit.snapshot(clear, limits).level, "closed");
assert.equal(Circuit.canAccept("p4_bulk", clear, limits).startAllowed, true);

console.log(JSON.stringify({
	ok: true,
	suite: "circuit-rolling-pressure",
	p0Survives: true,
	hardWorkParks: true,
	rollingPressurePreserved: true
}));

function context(lastMs, maxMs, queued = 0) {
	return {
		eventLoopLag: { lastMs, maxMs },
		lanes: { p4_bulk: { queued } },
		workers: { current: { active: 0 }, health: { ok: true } },
		lastSuccessfulActionAt: Date.now()
	};
}
