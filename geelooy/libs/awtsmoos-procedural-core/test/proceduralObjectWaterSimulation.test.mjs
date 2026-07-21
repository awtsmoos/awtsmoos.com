// B"H
// Boruch Hashem
// Blessed is He
/** Water evidence proves stillness, propagation, non-negative height, and projection. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const still = api.createShallowWaterState({ width: 5, height: 5, cellSize: 1, fill: 1 });
const stillStep = api.stepShallowWater(still, { deltaTime: 0.05, substeps: 2 });
assert.ok(stillStep.height.values.every(value => Math.abs(value - 1) < 1e-12));
assert.ok(stillStep.velocity.x.every(value => Math.abs(value) < 1e-12));

const disturbedValues = Array(25).fill(1);
disturbedValues[12] = 2;
const disturbed = api.createShallowWaterState({
	heightGrid: { width: 5, height: 5, cellSize: 1, values: disturbedValues }
});
const propagated = api.stepShallowWater(disturbed, { deltaTime: 0.03, substeps: 3 });
assert.ok(propagated.height.values.every(value => value >= 0));
assert.notDeepEqual(propagated.height.values, disturbed.height.values);

const velocity = api.createVectorGrid2d({ width: 5, height: 5, x: Array.from({ length: 25 }, (_, index) => index % 5) });
const before = api.measureVelocityDivergence2d(velocity).values.reduce((sum, value) => sum + Math.abs(value), 0);
const projected = api.projectVelocity2d(velocity, 40);
const after = api.measureVelocityDivergence2d(projected).values.reduce((sum, value) => sum + Math.abs(value), 0);
assert.ok(after < before);

console.log('B"H | proceduralObjectWaterSimulation.test passed');
