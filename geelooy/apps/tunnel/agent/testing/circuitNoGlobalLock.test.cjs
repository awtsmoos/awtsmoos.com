// B"H
const assert = require('assert');
const Circuit = require('../lib/runtime/circuit-breaker.js');

/**
 * B"H
 * One agent may sleep in a mountain-long subprocess, but no lag-cloud may lock
 * the whole palace. The breaker may warn, never shackle, unless the queue is
 * truly full.
 */
const limits = { ...Circuit.DEFAULTS, panicLagMs: 5000, p3QueueLimit: 2, p4QueueLimit: 1 };
const base = {
  eventLoopLag: { lastMs: 9999, maxMs: 9999 },
  lanes: { p3_heavy: { queued: 0 }, p4_bulk: { queued: 0 } },
  workers: { active: {} },
  maxQueue: 5000,
  lastSuccessfulActionAt: 0
};

const panic = Circuit.canAccept('p3_heavy', base, limits, { action: 'commandRun' });
assert.equal(panic.ok, true);
assert.equal(panic.circuitLevel, 'panic');
assert.equal(panic.pressureReason, 'kernel_panic_lag_only_p0');
assert.equal(panic.blockingReason, '');
assert.equal(panic.reason, 'admitted_despite_pressure');

const full = Circuit.canAccept('p3_heavy', { ...base, eventLoopLag: { lastMs: 0, maxMs: 0 }, lanes: { p3_heavy: { queued: 2 } } }, limits, { action: 'commandRun' });
assert.equal(full.ok, false);
assert.equal(full.blockingReason, 'p3_backpressure');
assert.equal(full.reason, 'p3_backpressure');

console.log(JSON.stringify({ ok: true, checks: ['panic-lag-is-advisory', 'backpressure-still-blocks'] }, null, 2));
