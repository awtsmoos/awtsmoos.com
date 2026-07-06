// B"H
const assert = require('assert');
const Circuit = require('../lib/runtime/circuit-breaker.js');
const Live = require('../lib/runtime/liveness-status.js');
const limits = { ...Circuit.DEFAULTS, hardLagMs:2000, panicLagMs:5000, softLagMs:500 };
const context = { eventLoopLag:{ lastMs:9000, maxMs:11000 }, lanes:{ p3_heavy:{ queued:0 } }, lastSuccessfulActionAt:Date.now() };
const snap = Circuit.snapshot(context, limits);
const status = Live.statusFromCircuit(snap);
assert.equal(snap.level, 'panic');
assert.equal(status.isAlive, true);
assert.equal(status.canRoute, true);
assert.equal(status.state, 'lagging_but_routable');
console.log(JSON.stringify({ ok:true, suite:'livenessStatusSlowButAlive', status }, null, 2));
