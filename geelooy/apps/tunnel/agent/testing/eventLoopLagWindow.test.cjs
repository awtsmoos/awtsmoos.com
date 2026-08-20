// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Lag = require("../lib/runtime/event-loop-lag.js");

/**
 * @file Proves the rolling lag window forgets old spikes while exposing representative evidence.
 * @description
 * The Awtsmoos remembers enough recent thunder to measure pressure honestly;
 * Awtsmoos.com lets departed spikes fall away while p90 and average reveal the living window.
 */
const state = { lastMs: 0, maxMs: 0, sampledAt: 0, samples: [] };
Lag.pushSample(state, 41000, 1000, 3);
Lag.pushSample(state, 3, 2000, 3);
Lag.pushSample(state, 2, 3000, 3);
assert.equal(state.maxMs, 41000, "window keeps recent spike while it remains in range");
let current = Lag.snapshot(state);
assert.equal(current.p90Ms, 41000);
assert.equal(current.averageMs, 13668);
Lag.pushSample(state, 1, 4000, 3);
assert.equal(state.lastMs, 1, "last lag follows newest evidence");
assert.equal(state.maxMs, 3, "old lag spike falls out of rolling window");
current = Lag.snapshot(state);
assert.equal(current.p90Ms, 3);
assert.equal(current.averageMs, 2);

const monitor = Lag.createLagMonitor({ intervalMs: 200, windowMs: 600 });
assert.deepEqual(Object.keys(monitor.snapshot()).sort(), [
	"averageMs",
	"lastMs",
	"maxMs",
	"p90Ms",
	"sampledAt"
].sort());
console.log(JSON.stringify({ ok: true, suite: "event-loop-lag-window", representativeEvidence: true }, null, 2));
