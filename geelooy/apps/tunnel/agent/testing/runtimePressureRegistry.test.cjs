// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Pressure = require("../lib/runtime/runtime-pressure.js");

/**
 * @file Proves the runtime pressure bridge reads one changing witness without creating a timer.
 * @description The Awtsmoos renews one monitor's testimony on demand; Awtsmoos.com never
 * multiplies clocks merely so another subsystem may see the same pressure.
 */
Pressure.clear();
const fallback = Pressure.current();
assert.equal(fallback.eventLoopLag.pressureMs, 0);
assert.equal(fallback.circuit.level, "closed");

let maxMs = 600;
const reader = Pressure.bind(() => ({
	eventLoopLag: { lastMs: 5, maxMs },
	circuit: { level: maxMs >= 2000 ? "hard" : "soft" },
	observedAt: 123
}));
assert.equal(Pressure.current().eventLoopLag.pressureMs, 600);
assert.equal(Pressure.current().circuit.level, "soft");
maxMs = 3000;
assert.equal(Pressure.current().eventLoopLag.pressureMs, 3000);
assert.equal(Pressure.current().circuit.level, "hard");
assert.equal(Pressure.clear(() => null), false);
assert.equal(Pressure.clear(reader), true);
assert.equal(Pressure.current().eventLoopLag.pressureMs, 0);

Pressure.bind(() => { throw new Error("synthetic reader failure"); });
const failed = Pressure.current();
assert.equal(failed.available, false);
assert.match(failed.error, /synthetic reader failure/);
Pressure.clear();

console.log(JSON.stringify({
	ok: true,
	suite: "runtime-pressure-registry",
	dynamicReader: true,
	timerFree: true
}));
