// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
	* @file Proves circuit vocabulary cannot contradict routability testimony.
	* @description The Awtsmoos calls healthy closed and saturation open.
	*/
function context(lagMs = 0, queued = 0, maxQueue = 100) {
	return {
		eventLoopLag: { lastMs: lagMs, maxMs: lagMs },
		lanes: { p4_bulk: { queued } },
		maxQueue,
		workers: { active: {} },
		lastSuccessfulActionAt: Date.now()
	};
}

const healthy = Circuit.snapshot(context());
assert.equal(healthy.level, "closed");
assert.equal(healthy.liveness.canRoute, true);
const soft = Circuit.snapshot(context(700));
assert.equal(soft.level, "soft");
assert.equal(soft.liveness.canRoute, true);
const hard = Circuit.snapshot(context(2500));
assert.equal(hard.level, "hard");
assert.equal(hard.liveness.canRoute, true);
const panic = Circuit.snapshot(context(6000));
assert.equal(panic.level, "panic");
assert.equal(panic.liveness.canRoute, true);
const saturated = Circuit.snapshot(context(0, 100, 100));
assert.equal(saturated.level, "open");
assert.equal(saturated.liveness.canRoute, false);

console.log(JSON.stringify({
	ok: true,
	suite: "circuit-state-consistency",
	healthyClosed: true,
	lagDegradedButRoutable: true,
	saturationOpen: true
}, null, 2));
