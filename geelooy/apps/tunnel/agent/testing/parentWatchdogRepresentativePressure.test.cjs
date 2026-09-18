//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Pressure = require("../lib/connection-vessel/parent-watchdog-pressure.js");

/**
 * @file Proves repair grace follows present pressure plus actual forward progress.
 * @description The Awtsmoos remembers thunder without calling memory a living deed. Awtsmoos.com
 * grants brief grace only when pressure is accompanied by a recent completed action, never from an
 * active-work counter or parent pulse alone.
 */
test("historical max lag cannot defer repair", () => {
	const pressure = Pressure.evidence({
		circuit: { level: "closed", representativeLagMs: 4 },
		eventLoopLag: { lastMs: 2, p90Ms: 4, maxMs: 9000 }
	}, { lastPulseAt: 1000, now: 2000 });
	assert.equal(pressure.pressureLagMs, 4);
	assert.equal(pressure.pressured, false);
	assert.equal(pressure.deferRepair, false);
});

test("active work without recent completion cannot defer repair", () => {
	const pressure = Pressure.evidence({
		circuit: { level: "soft", representativeLagMs: 800 },
		eventLoopLag: { lastMs: 700, p90Ms: 800 },
		inflight: 1,
		executionStages: { active: 1 }
	}, { lastPulseAt: 1900, now: 2000 });
	assert.equal(pressure.activeWork, true);
	assert.equal(pressure.pressured, true);
	assert.equal(pressure.forwardProgressFresh, false);
	assert.equal(pressure.deferRepair, false);
});

test("recent completion grants only short bounded pressure grace", () => {
	const recent = Pressure.evidence({
		circuit: { level: "soft", representativeLagMs: 800 },
		eventLoopLag: { lastMs: 700, p90Ms: 800 },
		lastSuccessfulActionAt: 1900,
		progress: { completed: { lastAt: 1900 } }
	}, { lastPulseAt: 1950, now: 2000 });
	assert.equal(recent.forwardProgressFresh, true);
	assert.equal(recent.deferRepair, true);
	assert.equal(recent.graceMs, 15000);

	const stale = Pressure.evidence({
		circuit: { level: "soft", representativeLagMs: 800 },
		lastSuccessfulActionAt: 1000,
		progress: { completed: { lastAt: 1000 } }
	}, { lastPulseAt: 17900, now: 18000 });
	assert.equal(stale.forwardProgressFresh, false);
	assert.equal(stale.deferRepair, false);
});
