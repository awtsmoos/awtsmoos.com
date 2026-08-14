// B"H

const assert = require("node:assert/strict");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Proves panic lag parks work without becoming a rejection-only global lock.
 * @description Capacity pressure may reject; lag pressure keeps one accepted deed queued.
 */
const limits = {
	...Circuit.DEFAULTS,
	panicLagMs: 5000,
	p3QueueLimit: 2,
	p4QueueLimit: 1
};
const base = {
	eventLoopLag: { lastMs: 9999, maxMs: 9999 },
	lanes: { p3_heavy: { queued: 0 }, p4_bulk: { queued: 0 } },
	workers: { current: { active: 0 }, health: { ok: true } },
	lastSuccessfulActionAt: Date.now()
};

const panic = Circuit.canAccept("p3_heavy", base, limits, { action: "commandRun" });
assert.equal(panic.ok, true);
assert.equal(panic.circuitLevel, "open");
assert.equal(panic.pressureReason, "kernel_panic_lag_only_p0");
assert.equal(panic.deferred, true);
assert.equal(panic.startAllowed, false);
assert.equal(panic.reason, "deferred_by_event_loop_pressure");

const full = Circuit.canAccept("p3_heavy", {
	...base,
	eventLoopLag: { lastMs: 0, maxMs: 0 },
	lanes: { p3_heavy: { queued: 2 } }
}, limits, { action: "commandRun" });
assert.equal(full.ok, false);
assert.equal(full.blockingReason, "p3_backpressure");
assert.equal(full.reason, "p3_backpressure");

console.log(JSON.stringify({
	ok: true,
	checks: ["panic-lag-parks", "backpressure-still-blocks"]
}, null, 2));
