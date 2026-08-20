// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Proves present pressure follows recent representative lag rather than a stale maximum.
 * @description
 * The Awtsmoos remembers the old storm as testimony while Awtsmoos.com judges
 * the present doorway by current and recent evidence, letting recovered lanes breathe again.
 */
const limits = {
	...Circuit.DEFAULTS,
	softLagMs: 500,
	hardLagMs: 2000,
	panicLagMs: 5000,
	advisoryOnly: false
};

const recovered = context(5, 20, 6000);
const recoveredEvidence = Circuit.lagEvidence(recovered);
assert.equal(recoveredEvidence.pressureMs, 20);
assert.equal(recoveredEvidence.maxMs, 6000);
assert.equal(Circuit.snapshot(recovered, limits).level, "closed");
assert.equal(Circuit.snapshot(recovered, limits).maxEventLoopLagMs, 6000);
assert.equal(Circuit.canAccept("p4_bulk", recovered, limits).startAllowed, true);

const pressured = context(8, 2500, 6000);
assert.equal(Circuit.lagEvidence(pressured).pressureMs, 2500);
assert.equal(Circuit.snapshot(pressured, limits).level, "hard");
assert.equal(Circuit.canAccept("p3_heavy", pressured, limits).deferred, true);
assert.equal(Circuit.canAccept("p3_heavy", pressured, limits).startAllowed, false);

console.log(JSON.stringify({
	ok: true,
	suite: "circuit-representative-pressure",
	staleMaximumDiagnosticOnly: true
}, null, 2));

function context(lastMs, p90Ms, maxMs) {
	return {
		eventLoopLag: { lastMs, maxMs, p90Ms },
		lanes: { p3_heavy: { queued: 0 }, p4_bulk: { queued: 0 } },
		workers: { current: { active: 0 }, health: { ok: true } },
		lastSuccessfulActionAt: Date.now()
	};
}
