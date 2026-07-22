// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { createParticleGridLiquidState } from "../src/core/proceduralObject/liquid3d/index.js";
import {
	createRealtimeLiquidArtifacts3d,
	stepRealtimeLiquid3d
} from "../src/core/proceduralObject/realtimeRealism/index.js";

function liquidState() {
	return createParticleGridLiquidState({
		shape: [6, 6, 6],
		cellSize: 0.25,
		origin: [0, 0, 0],
		capacity: 16,
		seed: 613,
		particles: [
			{ id: "p0", position: [0.4, 1.4, 0.4], velocity: [2.2, 1.4, 0], size: 0.04 },
			{ id: "p1", position: [0.5, 1.35, 0.5], velocity: [1.7, 0.2, 0.5], size: 0.05 },
			{ id: "p2", position: [0.55, 0.3, 0.55], velocity: [0.1, 0.3, 0], size: 0.045 },
			{ id: "p3", position: [0.6, 0.32, 0.6], velocity: [0.2, 0.1, 0], size: 0.045 }
		]
	});
}

test("liquid realism derives optics and four secondary systems deterministically", () => {
	const first = createRealtimeLiquidArtifacts3d(liquidState(), {
		secondaryParticles: { fastSpeed: 1, surfaceHeight: 0.65, sparseNeighbors: 3 }
	});
	const second = createRealtimeLiquidArtifacts3d(liquidState(), {
		secondaryParticles: { fastSpeed: 1, surfaceHeight: 0.65, sparseNeighbors: 3 }
	});
	assert.deepEqual(first.counts, second.counts);
	assert.equal(first.optics.ior, 1.333);
	assert.equal(Object.keys(first.secondary.systems).length, 4);
	assert.ok(first.counts.spray + first.counts.foam + first.counts.bubble >= 1);
	for (const artifact of Object.values(first.renderArtifacts)) {
		assert.ok(artifact.positions instanceof Float32Array);
		assert.equal(artifact.positions.length, artifact.count * 3);
	}
});

test("instant realtime step returns physics and derived appearance together", () => {
	const result = stepRealtimeLiquid3d(liquidState(), {
		physics: { deltaTime: 1 / 120, gravity: [0, -9.81, 0], surface: false },
		realism: { optics: { turbidity: 0.2 } }
	});
	assert.equal(result.state.tick, 1);
	assert.equal(result.realism.tick, 1);
	assert.equal(result.realism.optics.turbidity, 0.2);
	assert.ok(result.report);
});
