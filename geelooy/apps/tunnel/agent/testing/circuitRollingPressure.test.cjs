// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Proves recent hard lag survives a quiet sample while soft lag stays useful.
 * @description Control survives every pressure level; bounded bulk work queues under
 * soft pressure and bows only when rolling evidence reaches hard or panic.
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
	assert.equal(
		Circuit.canAccept(lane, hard, limits).blockingReason,
		"kernel_hard_lag_only_p0"
	);
}

const soft = context(5, 600);
assert.equal(Circuit.snapshot(soft, limits).level, "soft");
assert.equal(Circuit.canAccept("p1_fs_light", soft, limits).blockingReason, "");
assert.equal(Circuit.canAccept("p4_bulk", soft, limits).blockingReason, "");
assert.equal(Circuit.canAccept("p4_bulk", soft, limits).degraded, true);

const saturatedSoft = context(5, 600, limits.p4QueueLimit);
assert.equal(
	Circuit.canAccept("p4_bulk", saturatedSoft, limits).blockingReason,
	"p4_backpressure"
);

const panic = context(5, 6000);
assert.equal(Circuit.snapshot(panic, limits).level, "panic");
assert.equal(
	Circuit.canAccept("p3_heavy", panic, limits).blockingReason,
	"kernel_panic_lag_only_p0"
);

const clear = context(5, 40);
assert.equal(Circuit.snapshot(clear, limits).level, "closed");
assert.equal(Circuit.canAccept("p4_bulk", clear, limits).blockingReason, "");

console.log(JSON.stringify({
	ok: true,
	suite: "circuit-rolling-pressure",
	p0Survives: true,
	softBulkQueues: true,
	rollingHardBlocks: true
}));

function context(lastMs, maxMs, queued = 0) {
	return {
		eventLoopLag: { lastMs, maxMs },
		lanes: { p4_bulk: { queued } },
		workers: { current: { active: 0 }, health: { ok: true } },
		lastSuccessfulActionAt: Date.now()
	};
}
