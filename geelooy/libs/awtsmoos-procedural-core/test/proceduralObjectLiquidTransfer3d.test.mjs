// B"H
// Boruch Hashem
// Blessed is He
/** Liquid transfer evidence proves normalized weights, mass conservation, and PIC/FLIP semantics. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

function assertVectorClose(actual, expected, tolerance = 1e-12) {
	assert.equal(actual.length, expected.length);
	for (let index = 0; index < actual.length; index += 1) {
		assert.ok(Math.abs(actual[index] - expected[index]) <= tolerance);
	}
}

const grid = {
	width: 5,
	height: 5,
	depth: 5,
	origin: [-1, -1, -1],
	cellSize: 0.5
};
for (const position of [[0.1, -0.2, 0.3], [-3, -3, -3], [3, 3, 3]]) {
	const weights = api.particleGridWeights3d(grid, position);
	assert.ok(weights.every(entry => entry.weight >= 0));
	assert.ok(Math.abs(weights.reduce((sum, entry) => sum + entry.weight, 0) - 1) < 1e-12);
	assert.equal(new Set(weights.map(entry => entry.index)).size, weights.length);
}

const particles = api.createParticleSystem({
	id: "liquid.transfer",
	capacity: 4,
	particles: [
		{ id: "a", position: [-0.2, 0, 0], velocity: [1, 2, 3], mass: 2, lifetime: 10 },
		{ id: "b", position: [0.2, 0, 0], velocity: [1, 2, 3], mass: 3, lifetime: 10 }
	]
});
const transfer = api.transferParticlesToGrid3d(particles, grid);
assert.ok(Math.abs(transfer.particleMass - 5) < 1e-12);
assert.ok(Math.abs(transfer.gridMass - 5) < 1e-12);
for (let index = 0; index < transfer.massGrid.values.length; index += 1) {
	if (transfer.massGrid.values[index] <= 0) {
		continue;
	}
	assertVectorClose([
		transfer.velocityGrid.x[index],
		transfer.velocityGrid.y[index],
		transfer.velocityGrid.z[index]
	], [1, 2, 3]);
}

const current = api.createVectorGrid3d({ ...grid, fillX: 2, fillY: 4 });
const previous = api.createVectorGrid3d({ ...grid, fillX: 1, fillY: 1 });
const source = api.createParticleSystem({
	particles: [{
		id: "p",
		position: [0, 0, 0],
		velocity: [4, 5, 0],
		lifetime: 10
	}]
});
const pic = api.transferGridToParticles3d(source, current, previous, 0);
const flip = api.transferGridToParticles3d(source, current, previous, 1);
const mixed = api.transferGridToParticles3d(source, current, previous, 0.5);
assertVectorClose(pic.particles[0].velocity, [2, 4, 0]);
assertVectorClose(flip.particles[0].velocity, [5, 8, 0]);
assertVectorClose(mixed.particles[0].velocity, [3.5, 6, 0]);

console.log('B"H | proceduralObjectLiquidTransfer3d.test passed');
