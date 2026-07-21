// B"H
// Boruch Hashem
// Blessed is He
/** Three-dimensional fire evidence proves advection, projection, and fuel conversion. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const constant = api.createScalarGrid3d({ width: 4, height: 4, depth: 4, fill: 2 });
const stillVelocity = api.createVectorGrid3d({ width: 4, height: 4, depth: 4 });
const advected = api.advectScalarGrid3d(constant, stillVelocity, 0.2);
assert.ok(advected.values.every(value => Math.abs(value - 2) < 1e-12));

const xVelocity = [];
for (let z = 0; z < 5; z += 1) {
	for (let y = 0; y < 5; y += 1) {
		for (let x = 0; x < 5; x += 1) xVelocity.push(x - 2);
	}
}
const divergent = api.createVectorGrid3d({ width: 5, height: 5, depth: 5, x: xVelocity });
const before = api.measureVelocityDivergence3d(divergent).values
	.reduce((sum, value) => sum + Math.abs(value), 0);
const projected = api.projectVelocity3d(divergent, 60);
const after = api.measureVelocityDivergence3d(projected).values
	.reduce((sum, value) => sum + Math.abs(value), 0);
assert.ok(after < before);

const fuel = Array(125).fill(0);
const temperature = Array(125).fill(0);
fuel[62] = 1;
temperature[62] = 1;
const state = api.createCombustionState3d({
	width: 5, height: 5, depth: 5,
	fuel: { values: fuel },
	temperature: { values: temperature }
});
const burned = api.stepCombustion3d(state, {
	deltaTime: 0.05,
	burnRate: 1,
	heatYield: 3,
	smokeYield: 2
});
assert.ok(burned.fuel.values[62] < 1);
assert.ok(burned.temperature.values[62] > 1);
assert.ok(burned.density.values[62] > 0);
assert.ok([...burned.velocity.x, ...burned.velocity.y, ...burned.velocity.z].every(Number.isFinite));

console.log('B"H | proceduralObjectCombustion3d.test passed');
