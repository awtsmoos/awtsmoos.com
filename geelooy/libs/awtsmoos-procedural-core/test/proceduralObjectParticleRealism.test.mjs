// B"H
// Boruch Hashem
// Blessed is He
/** Particle realism evidence proves adaptive forces, turbulence, friction, and reports. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const initial = api.createParticleSystem({
	id: "particles.realism",
	seed: 42,
	capacity: 4,
	particles: [
		{
			id: "drop",
			position: [0, 0.04, 0],
			velocity: [4, -6, 0],
			mass: 1,
			size: 0.08,
			age: 0,
			lifetime: 5,
			attributes: {}
		}
	]
});
const options = {
	deltaTime: 0.12,
	quality: "high",
	forces: [
		{ type: "gravity", vector: [0, -9.81, 0] },
		{ type: "wind", vector: [2, 0, 1], coefficient: 0.3 },
		{ type: "turbulence", seed: 11, frequency: 2, strength: 0.8 },
		{ type: "attractor", center: [0, 1, 0], strength: 0.2, falloff: 1 }
	],
	planes: [
		{ normal: [0, 1, 0], offset: 0, restitution: 0.25, friction: 0.4 }
	]
};
const first = api.stepParticleSystemDetailed(initial, options);
const second = api.stepParticleSystemDetailed(initial, options);
assert.deepEqual(first, second);
assert.ok(first.report.substeps > 1);
assert.ok(first.report.collisionCount > 0);
assert.deepEqual(first.report.forceTypes, [
	"gravity", "wind", "turbulence", "attractor"
]);
assert.ok(Number.isFinite(first.report.kineticEnergyAfter));
assert.ok(first.system.particles[0].position[1] >= 0);
const turbulence = api.sampleParticleTurbulence([1, 2, 3], {
	seed: 9,
	time: 0.5
});
assert.deepEqual(turbulence, api.sampleParticleTurbulence([1, 2, 3], {
	seed: 9,
	time: 0.5
}));

console.log('B"H | proceduralObjectParticleRealism.test passed');
