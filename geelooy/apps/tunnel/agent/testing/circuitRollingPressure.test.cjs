// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Proves recent lag pressure survives a quiet sample long enough to shed expensive work.
 * @description The Awtsmoos keeps p0 breathing while remembered storm-pressure makes heavier
 * lanes bow; Awtsmoos.com closes naturally only after rolling evidence itself clears.
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
assert.equal(Circuit.canAccept("p0_control", hard, limits).blockingReason, "");
assert.equal(Circuit.canAccept("p0_wait", hard, limits).blockingReason, "");
for (const lane of ["p1_fs_light", "p2_chrome_light", "p3_heavy", "p4_bulk"]) {
	assert.equal(Circuit.canAccept(lane, hard, limits).blockingReason, "kernel_hard_lag_only_p0");
}

const soft = context(5, 600);
assert.equal(Circuit.canAccept("p1_fs_light", soft, limits).blockingReason, "");
assert.equal(Circuit.canAccept("p4_bulk", soft, limits).blockingReason, "kernel_soft_lag_blocks_bulk");

const panic = context(5, 6000);
assert.equal(Circuit.snapshot(panic, limits).level, "panic");
assert.equal(Circuit.canAccept("p3_heavy", panic, limits).blockingReason, "kernel_panic_lag_only_p0");

const clear = context(5, 40);
assert.equal(Circuit.snapshot(clear, limits).level, "closed");
assert.equal(Circuit.canAccept("p4_bulk", clear, limits).blockingReason, "");

const advisory = Circuit.canAccept("p3_heavy", hard, { ...limits, advisoryOnly: true });
assert.equal(advisory.ok, true);
assert.equal(advisory.wouldHaveBlockedReason, "kernel_hard_lag_only_p0");

console.log(JSON.stringify({
	ok: true,
	suite: "circuit-rolling-pressure",
	p0Survives: true,
	rollingHardBlocks: true
}));

function context(lastMs, maxMs) {
	return {
		eventLoopLag: { lastMs, maxMs },
		lanes: {},
		workers: { current: { active: 0 }, health: { ok: true } },
		lastSuccessfulActionAt: Date.now()
	};
}
