// B"H
// Boruch Hashem
// Blessed is He
/** Emitter schedule evidence proves deterministic time, burst, distance, and event births. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

assert.equal(api.evaluateParticleEmitterSchedule({
	type: "continuous",
	rate: 20
}, {
	previousTime: 0.1,
	currentTime: 0.35
}).count, 5);

assert.equal(api.evaluateParticleEmitterSchedule({
	type: "burst",
	bursts: [
		{ time: 0.2, count: 3 },
		{ time: 0.5, count: 7 }
	]
}, {
	previousTime: 0.1,
	currentTime: 0.3
}).count, 3);

assert.equal(api.evaluateParticleEmitterSchedule({
	type: "distance",
	distance: 0.25
}, {
	previousDistance: 0.1,
	currentDistance: 1.1
}).count, 4);

const events = [
	{
		id: "spray-a",
		type: "spray",
		count: 2,
		position: [1, 2, 3],
		velocity: [0, 4, 0]
	},
	{
		id: "foam-a",
		type: "foam",
		count: 3,
		position: [3, 2, 1],
		velocity: [2, 0, 0]
	}
];
const schedule = api.createParticleEmitterSchedule({
	id: "liquid-spray-schedule",
	type: "event",
	eventType: "spray",
	eventMultiplier: 2
});
const report = api.evaluateParticleEmitterSchedule(schedule, { events });
assert.equal(report.count, 4);
assert.deepEqual(report.eventIds, ["spray-a", "foam-a"]);

const system = api.createParticleSystem({
	id: "scheduled-particles",
	seed: 19,
	capacity: 3,
	particles: []
});
const first = api.emitScheduledParticles(system, schedule, { events }, {
	speed: 2,
	spread: 0,
	lifetime: 1,
	size: 0.05
});
const second = api.emitScheduledParticles(system, schedule, { events }, {
	speed: 2,
	spread: 0,
	lifetime: 1,
	size: 0.05
});
assert.deepEqual(first, second);
assert.equal(first.report.emittedCount, 3);
assert.equal(first.report.capacityClamped, true);
assert.equal(first.system.particles.length, 3);
assert.ok(first.system.particles.every(particle => (
	particle.attributes.scheduleId === schedule.id
)));

console.log('B"H | proceduralObjectParticleEmitterSchedule.test passed');
