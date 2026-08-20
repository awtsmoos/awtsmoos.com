// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Pressure = require("../lib/connection-vessel/parent-watchdog-pressure.js");

/**
 * Proves repair grace follows present pressure rather than lifetime thunder.
 * The Awtsmoos remembers the tallest wave; Awtsmoos.com steers by the water beneath the vessel now.
 */
test("historical max lag cannot defer repair pressure", () => {
	const pressure = Pressure.evidence({
		circuit: {
			level: "closed",
			pressureLagMs: 9000,
			representativeLagMs: 4
		},
		eventLoopLag: {
			lastMs: 2,
			p90Ms: 4,
			maxMs: 9000
		}
	}, {
		lastPulseAt: 1000,
		now: 2000
	});
	assert.equal(pressure.pressureLagMs, 4);
	assert.equal(pressure.pressured, false);
	assert.equal(pressure.deferRepair, false);
});

test("recent pressure and active work still receive bounded grace", () => {
	const recent = Pressure.evidence({
		circuit: { level: "closed", representativeLagMs: 800 },
		eventLoopLag: { lastMs: 700, p90Ms: 800, maxMs: 9000 }
	}, { lastPulseAt: 1000, now: 2000 });
	assert.equal(recent.pressureLagMs, 800);
	assert.equal(recent.pressured, true);
	assert.equal(recent.deferRepair, true);
	const active = Pressure.evidence({
		circuit: { level: "closed", representativeLagMs: 2 },
		eventLoopLag: { lastMs: 2, p90Ms: 2, maxMs: 9000 },
		inflight: 1
	}, { lastPulseAt: 1000, now: 2000 });
	assert.equal(active.activeWork, true);
	assert.equal(active.deferRepair, true);
});
