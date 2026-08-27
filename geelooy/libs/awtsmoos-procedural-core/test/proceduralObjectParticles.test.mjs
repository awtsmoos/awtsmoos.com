// B"H
// Boruch Hashem
// Blessed is He
/** Particle evidence proves repeatable birth, force integration, and collision. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const initial = api.createParticleSystem({ id: "particles.test", seed: 7, capacity: 8 });
const emitter = { count: 2, position: [0, 1, 0], direction: [1, 0, 0], speed: 2, spread: 0.2, lifetime: 3 };
const firstEmission = api.emitParticles(initial, emitter);
const secondEmission = api.emitParticles(initial, emitter);
assert.deepEqual(firstEmission.particles, secondEmission.particles);
assert.equal(new Set(firstEmission.particles.map(particle => particle.id)).size, 2);

const stepped = api.stepParticleSystem(firstEmission, {
	deltaTime: 0.25,
	substeps: 4,
	forces: [{ type: "gravity", vector: [0, -9.81, 0] }],
	planes: [{ normal: [0, 1, 0], offset: 0, restitution: 0.5 }]
});
assert.equal(stepped.tick, 1);
assert.equal(stepped.particles.length, 2);
assert.ok(stepped.particles.every(particle => particle.position[1] >= 0));
assert.ok(stepped.particles.every(particle => particle.age > 0));

console.log('B"H | proceduralObjectParticles.test passed');
