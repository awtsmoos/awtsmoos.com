// B"H
const assert = require('assert');
const Lag = require('../lib/runtime/event-loop-lag.js');

const state = { lastMs: 0, maxMs: 0, sampledAt: 0, samples: [] };
Lag.pushSample(state, 41000, 1000, 3);
Lag.pushSample(state, 3, 2000, 3);
Lag.pushSample(state, 2, 3000, 3);
assert.strictEqual(state.maxMs, 41000, 'window keeps recent spike while it is still in range');
Lag.pushSample(state, 1, 4000, 3);
assert.strictEqual(state.lastMs, 1, 'last lag follows newest evidence');
assert.strictEqual(state.maxMs, 3, 'old lag spike falls out of rolling window');

const monitor = Lag.createLagMonitor({ intervalMs: 200, windowMs: 600 });
assert.deepStrictEqual(Object.keys(monitor.snapshot()).sort(), ['lastMs', 'maxMs', 'sampledAt'].sort());
console.log(JSON.stringify({ ok: true, suite: 'event-loop-lag-window' }, null, 2));
