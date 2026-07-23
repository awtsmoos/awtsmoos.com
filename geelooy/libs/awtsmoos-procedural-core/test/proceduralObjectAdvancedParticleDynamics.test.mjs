// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import { stepAdvancedParticleSystem } from "../src/core/proceduralObject/realtimeRealism/index.js";

function system() {
	return createParticleSystem({
		id: "advanced-particles",
		seed: 73,
		capacity: 8,
		particles: [
			{ id: "fall", position: [0, 0.15, 0], velocity: [0.2, -1.2, 0], size: 0.05, age: 0, lifetime: 4 },
			{ id: "sphere", position: [0.55, 0.5, 0], velocity: [-1.2, 0, 0], size: 0.04, age: 0, lifetime: 4 }
		]
	});
}

function options() {
	return {
		deltaTime: 1 / 30,
		substeps: 4,
		time: 0,
		forces: {
			gravity: [0, -9.81, 0],
			wind: [0.4, 0, 0],
			turbulence: 0.15,
			drag: 0.04,
			attractors: [{ position: [0, 1, 0], strength: 0.08 }],
			vortices: [{ position: [0, 0, 0], axis: [0, 1, 0], strength: 0.05, lift: 0.02 }]
		},
		collisions: {
			restitution: 0.55,
			friction: 0.12,
			shapes: [
				{ type: "plane", normal: [0, 1, 0], offset: 0 },
				{ type: "sphere", center: [0, 0.5, 0], radius: 0.4 }
			]
		}
	};
}

test("advanced particle dynamics is deterministic with substeps and fields", () => {
	const first = stepAdvancedParticleSystem(system(), options());
	const second = stepAdvancedParticleSystem(system(), options());
	assert.deepEqual(first, second);
	assert.equal(first.report.substeps, 4);
	assert.equal(first.system.particles.length, 2);
	assert.ok(first.system.particles.every((particle) => particle.position.every(Number.isFinite)));
	assert.ok(first.system.particles.every((particle) => particle.velocity.every(Number.isFinite)));
});

test("plane and sphere collisions produce bounded contact response", () => {
	let state = system();
	let collisions = 0;
	for (let index = 0; index < 12; index += 1) {
		const result = stepAdvancedParticleSystem(state, { ...options(), time: index / 30 });
		state = result.system;
		collisions = Math.max(collisions, result.report.collisions);
	}
	assert.ok(collisions > 0);
	for (const particle of state.particles) {
		assert.ok(particle.position[1] >= particle.size - 1e-6);
		assert.ok(particle.age > 0);
	}
});
