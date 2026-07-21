// B"H
// Boruch Hashem
// Blessed is He
/** Particle reconstruction evidence proves radius-aware deterministic liquid surfaces. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const system = api.createParticleSystem({
	id: "particle.surface.system",
	capacity: 4,
	particles: [
		{ id: "left", position: [-0.35, 0, 0], velocity: [0, 0, 0], size: 0.65, lifetime: 10 },
		{ id: "right", position: [0.35, 0, 0], velocity: [0, 0, 0], size: 0.65, lifetime: 10 }
	]
});
const declaration = {
	width: 17, height: 17, depth: 17,
	origin: [-1.6, -1.6, -1.6],
	cellSize: 0.2
};
const grid = api.createParticleSignedDistanceGrid3d(system, declaration, { radiusScale: 1 });
assert.ok(api.sampleScalarGrid3d(grid, [-0.35, 0, 0]) < 0);
assert.ok(api.sampleScalarGrid3d(grid, [1.5, 1.5, 1.5]) > 0);
const first = api.extractMarchingCubesSurface(grid, { id: "particle.surface" });
const second = api.extractMarchingCubesSurface(
	api.createParticleSignedDistanceGrid3d(system, declaration, { radiusScale: 1 }),
	{ id: "particle.surface" }
);
assert.ok(first.indices.count > 0);
assert.deepEqual(first.attributes.position.array, second.attributes.position.array);
assert.deepEqual(first.indices.array, second.indices.array);
const positions = first.attributes.position.array;
assert.ok(Math.min(...positions) >= -1.1);
assert.ok(Math.max(...positions) <= 1.1);

console.log('B"H | proceduralObjectParticleSurface.test passed');
