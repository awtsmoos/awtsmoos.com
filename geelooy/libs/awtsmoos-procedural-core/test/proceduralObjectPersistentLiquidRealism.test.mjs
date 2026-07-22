// B"H
import test from "node:test";
import assert from "node:assert/strict";
import {
	createPersistentRealtimeLiquidState3d,
	stepPersistentRealtimeLiquid3d
} from "../src/core/proceduralObject/realtimeRealism/index.js";

function input() {
	return {
		shape: [8, 8, 8],
		cellSize: 0.25,
		origin: [0, 0, 0],
		capacity: 32,
		seed: 903,
		particles: [
			{ id: "a", position: [0.4, 1.7, 0.4], velocity: [2.8, 1.9, 0.2], size: 0.04 },
			{ id: "b", position: [0.5, 1.65, 0.5], velocity: [1.9, 0.4, 0.8], size: 0.05 },
			{ id: "c", position: [0.6, 0.3, 0.6], velocity: [0.1, 0.25, 0], size: 0.04 },
			{ id: "d", position: [0.7, 0.32, 0.7], velocity: [0.2, 0.1, 0], size: 0.04 }
		]
	};
}

function options() {
	return {
		deltaTime: 1 / 120,
		physics: { gravity: [0, -9.81, 0], surface: false },
		secondaryParticles: { fastSpeed: 0.8, surfaceHeight: 0.6, sparseNeighbors: 3 },
		budgets: { maximumPerRole: 12 },
		secondaryDynamics: {
			collision: { restitution: 0.3, friction: 0.1 }
		}
	};
}

test("persistent liquid realism advances secondary particles through time", () => {
	const state = createPersistentRealtimeLiquidState3d(input(), options());
	const first = stepPersistentRealtimeLiquid3d(state, options());
	const second = stepPersistentRealtimeLiquid3d(first, options());
	assert.equal(first.frame, 1);
	assert.equal(second.frame, 2);
	assert.ok(second.time > first.time);
	assert.equal(Object.keys(second.secondarySystems).length, 4);
	for (const [role, system] of Object.entries(second.secondarySystems)) {
		assert.ok(system.particles.length <= 12, role);
		assert.equal(second.render.renderArtifacts[role].count, system.particles.length);
		assert.ok(second.render.renderArtifacts[role].positions instanceof Float32Array);
	}
});

test("persistent liquid replay is deterministic", () => {
	const run = () => {
		let state = createPersistentRealtimeLiquidState3d(input(), options());
		for (let index = 0; index < 3; index += 1) {
			state = stepPersistentRealtimeLiquid3d(state, options());
		}
		return state;
	};
	const first = run();
	const second = run();
	assert.deepEqual(first.report.counts, second.report.counts);
	assert.deepEqual(first.optics, second.optics);
	for (const role of ["spray", "foam", "bubble", "mist"]) {
		assert.deepEqual(
			first.secondarySystems[role].particles,
			second.secondarySystems[role].particles
		);
	}
});

test("bubble and spray dynamics remain role-specific and bounded", () => {
	let state = createPersistentRealtimeLiquidState3d(input(), options());
	const initialBubble = state.secondarySystems.bubble.particles[0] ?? null;
	const initialSpray = state.secondarySystems.spray.particles[0] ?? null;
	state = stepPersistentRealtimeLiquid3d(state, options());
	if (initialBubble) {
		const bubble = state.secondarySystems.bubble.particles.find(
			(particle) => particle.id === initialBubble.id
		);
		if (bubble) {
			assert.ok(bubble.velocity[1] >= initialBubble.velocity[1] - 0.1);
		}
	}
	if (initialSpray) {
		const spray = state.secondarySystems.spray.particles.find(
			(particle) => particle.id === initialSpray.id
		);
		if (spray) {
			assert.ok(spray.velocity[1] < initialSpray.velocity[1]);
		}
	}
	for (const system of Object.values(state.secondarySystems)) {
		for (const particle of system.particles) {
			assert.ok(particle.position.every(Number.isFinite));
			assert.ok(particle.velocity.every(Number.isFinite));
		}
	}
});
