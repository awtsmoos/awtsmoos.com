// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Proves recent hard lag preserves control while an older larger maximum stays diagnostic.
 * @description
 * The Awtsmoos remembers a 9000ms storm without pretending it is still happening;
 * Awtsmoos.com parks rolling heavy work from present 3000ms evidence while keeping p0 alive.
 */
const limits = {
	...Circuit.DEFAULTS,
	advisoryOnly: false,
	hardLagMs: 2000,
	panicLagMs: 5000,
	softLagMs: 500
};
const context = {
	eventLoopLag: { lastMs: 3000, maxMs: 9000, p90Ms: 3000 },
	lanes: { p3_heavy: { queued: 0 }, p0_control: { queued: 0 } },
	workers: { current: { active: 0 }, health: { ok: true } },
	lastSuccessfulActionAt: Date.now()
};

const control = Circuit.canAccept("p0_control", context, limits, {
	action: "tunnelDoctor"
});
assert.equal(control.ok, true);
assert.equal(control.startAllowed, true);
assert.equal(control.circuitLevel, "hard");
assert.equal(control.maxEventLoopLagMs, 9000);
assert.equal(control.pressureLagMs, 3000);

const heavy = Circuit.canAccept("p3_heavy", context, limits, {
	action: "commandRun"
});
assert.equal(heavy.ok, true);
assert.equal(heavy.deferred, true);
assert.equal(heavy.startAllowed, false);
assert.equal(heavy.degraded, true);
assert.equal(heavy.pressureReason, "kernel_hard_lag_only_p0");
assert.equal(heavy.reason, "deferred_by_event_loop_pressure");
assert.equal(heavy.error, undefined);

console.log("event loop lag circuit preserves p0 and parks recent-hard work without stale-max panic");
