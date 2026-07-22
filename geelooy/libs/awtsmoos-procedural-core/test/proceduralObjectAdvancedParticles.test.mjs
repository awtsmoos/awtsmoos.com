// B"H
// Boruch Hashem
// Blessed is He
/** Advanced particle evidence proves adaptive integration, rich contacts, trails, and motion buffers. */
import assert from "node:assert/strict";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import { collideAdvancedParticle } from "../src/core/proceduralObject/particles/collideAdvancedParticles.js";
import { createParticleRenderArtifact } from "../src/core/proceduralObject/particles/createParticleRenderArtifact.js";
import { planParticleSubsteps } from "../src/core/proceduralObject/particles/planParticleSubsteps.js";
import { stepAdvancedParticleSystem } from "../src/core/proceduralObject/particles/stepAdvancedParticleSystem.js";

const particle = { id: "p", position: [0, 0, 0], velocity: [-1, 0.2, 0], mass: 1, size: 0.2, age: 0, lifetime: 2, attributes: { color: [0.2, 0.4, 1, 0.8] } };
const collision = collideAdvancedParticle(particle, [{ type: "sphere", center: [0, 0, 0], radius: 1, restitution: 0.4, friction: 0.25 }]);
assert.equal(collision.contacts, 1);
assert.ok(Math.hypot(...collision.particle.position) >= 1.09);
const system = createParticleSystem({ id: "advanced.particles", capacity: 4, particles: [{ ...particle, position: [0, 1, 0], velocity: [20, -1, 0] }] });
const plan = planParticleSubsteps(system, { deltaTime: 0.1, qualityProfile: "balanced" });
assert.ok(plan.substeps > 1);
const options = {
	deltaTime: 0.1,
	qualityProfile: "balanced",
	forces: [{ type: "gravity", vector: [0, -9.81, 0] }],
	colliders: [{ type: "plane", normal: [0, 1, 0], offset: 0, restitution: 0.2, friction: 0.3 }]
};
const first = stepAdvancedParticleSystem(system, options);
const second = stepAdvancedParticleSystem(system, options);
assert.deepEqual(first, second);
assert.equal(first.system.tick, 1);
const artifact = createParticleRenderArtifact(first.system);
assert.equal(artifact.positions.length, first.system.particles.length * 3);
assert.equal(artifact.motionVectors.length, artifact.positions.length);
assert.equal(artifact.colors.length, first.system.particles.length * 4);
assert.ok(artifact.metadata.trailCount >= 1);
console.log('B"H | proceduralObjectAdvancedParticles.test passed');
