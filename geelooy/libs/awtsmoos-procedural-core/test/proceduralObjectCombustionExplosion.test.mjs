// B"H
// Boruch Hashem
// Blessed is He
/** Fire and explosion evidence proves fuel conversion and explicit energy coupling. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const fuel = Array(25).fill(0);
const temperature = Array(25).fill(0);
fuel[12] = 1;
temperature[12] = 1;
const state = api.createCombustionState({
	width: 5, height: 5,
	fuel: { values: fuel },
	temperature: { values: temperature }
});
const burned = api.stepCombustion(state, { deltaTime: 0.1, burnRate: 1, heatYield: 2, smokeYield: 1 });
assert.ok(burned.fuel.values[12] < state.fuel.values[12]);
assert.ok(burned.temperature.values[12] > state.temperature.values[12]);
assert.ok(burned.density.values[12] > 0);

const event = api.createExplosionEvent({ center: [2, 2, 0], radius: 2, energy: 3, heat: 5, smoke: 2 });
const exploded = api.applyExplosionToCombustion(state, event);
assert.ok(exploded.temperature.values[12] > state.temperature.values[12]);
assert.ok(Math.hypot(exploded.velocity.x[13], exploded.velocity.y[13]) > 0);

const system = api.createParticleSystem({ particles: [{ id: "debris", position: [1, 0, 0], velocity: [0, 0, 0], lifetime: 2 }] });
const debris = api.applyExplosionToParticles(system, api.createExplosionEvent({ center: [0, 0, 0], radius: 3, energy: 2 }));
assert.ok(debris.particles[0].velocity[0] > 0);

console.log('B"H | proceduralObjectCombustionExplosion.test passed');
