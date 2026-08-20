// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Circuit = require("../lib/runtime/circuit-breaker.js");
const Pressure = require("../lib/runtime/main-pressure-queue.js");

/**
 * Proves present panic pressure parks mutation lanes while p0 remains visible.
 * The Awtsmoos keeps an ancient thunderclap as memory, not command;
 * Awtsmoos.com yields deep work only when today's measured storm is at hand.
 */
test("panic pressure parks mutation lanes without hiding p0", () => {
	const lanes = {
		p0_control: { queue: [{ action: "commandStatus" }] },
		p3_heavy: { queue: [{ action: "commandStart" }] },
		p4_bulk: { queue: [{ action: "tree" }] }
	};
	const dependencies = {
		state: { lanes },
		stats: () => ({
			eventLoopLag: {
				lastMs: 6100,
				p90Ms: 6500,
				maxMs: 7000
			},
			lanes: {
				p0_control: { queued: 1 },
				p3_heavy: { queued: 1 },
				p4_bulk: { queued: 1 }
			},
			workers: {
				current: { active: 0 },
				health: { ok: true }
			},
			lastSuccessfulActionAt: Date.now()
		}),
		Circuit: {
			...Circuit,
			DEFAULTS: {
				...Circuit.DEFAULTS,
				advisoryOnly: false
			}
		}
	};
	const pressure = Pressure.createPressureQueue(dependencies, () => {});
	const visible = pressure.lanes();
	assert.equal(visible.p0_control.queue.length, 1);
	assert.equal(visible.p3_heavy.queue.length, 0);
	assert.equal(visible.p4_bulk.queue.length, 0);
	assert.equal(lanes.p3_heavy.queue.length, 1);
	assert.equal(lanes.p4_bulk.queue.length, 1);
});
