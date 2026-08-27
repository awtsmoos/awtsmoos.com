// B"H
// Boruch Hashem
// Blessed is He
/** Live liquid surface evidence proves deterministic SDF reconstruction and indexed skinning. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const state = api.createParticleGridLiquidState({
	grid: {
		width: 17, height: 17, depth: 17,
		origin: [-1.6, -1.6, -1.6],
		cellSize: 0.2
	},
	particleSystem: {
		id: "liquid.surface", capacity: 8,
		particles: [
			{ id: "left", position: [-0.35, 0, 0], velocity: [0, 0, 0], size: 0.55, lifetime: 10 },
			{ id: "center", position: [0, 0.1, 0], velocity: [0, 0, 0], size: 0.55, lifetime: 10 },
			{ id: "right", position: [0.35, 0, 0], velocity: [0, 0, 0], size: 0.55, lifetime: 10 }
		]
	}
});
const first = api.createLiquidSurface3d(state, { id: "liquid.skin" });
const second = api.createLiquidSurface3d(state, { id: "liquid.skin" });
assert.ok(first.geometry.indices.array.length > 0);
assert.ok(first.geometry.attributes.position.count > 0);
assert.ok(Math.max(...first.geometry.indices.array) < first.geometry.attributes.position.count);
assert.deepEqual(first.sdf.values, second.sdf.values);
assert.deepEqual(first.geometry.indices.array, second.geometry.indices.array);
assert.deepEqual(first.geometry.attributes.position.array, second.geometry.attributes.position.array);
const stepped = api.stepParticleGridLiquid3d(state, {
	deltaTime: 0.01,
	surface: { id: "liquid.stepped.skin" }
});
assert.ok(stepped.surface.geometry.indices.array.length > 0);
assert.equal(stepped.surface.geometry.metadata.extractor, "cube-face-loops");

console.log('B"H | proceduralObjectLiquidSurface3d.test passed');
