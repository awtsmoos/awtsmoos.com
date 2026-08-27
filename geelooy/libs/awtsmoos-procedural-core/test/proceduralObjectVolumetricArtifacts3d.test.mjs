// B"H
// Boruch Hashem
// Blessed is He
/** Volumetric evidence proves particles and combustion produce sparse physical channels. */
import assert from "node:assert/strict";
import test from "node:test";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import { createCombustionState3d } from "../src/core/proceduralObject/simulation3d/createCombustionState3d.js";
import { createCombustionVolumeArtifact3d } from "../src/core/proceduralObject/volumes/createCombustionVolumeArtifact3d.js";
import { createParticleVolumeArtifact3d } from "../src/core/proceduralObject/volumes/createParticleVolumeArtifact3d.js";

test("particle clouds splat deterministic density, temperature, and emission bricks", () => {
	const system = createParticleSystem({
		id: "volume.particles",
		capacity: 4,
		particles: [{
			id: "glow",
			position: [0, 0, 0],
			velocity: [0, 0, 0],
			mass: 1,
			size: 0.2,
			age: 0,
			lifetime: 2,
			attributes: { density: 2, temperature: 3, emission: 4 }
		}]
	});
	const first = createParticleVolumeArtifact3d(system, { resolution: 12, brickSize: 4 });
	const second = createParticleVolumeArtifact3d(system, { resolution: 12, brickSize: 4 });
	assert.deepEqual(first, second);
	assert.ok(first.density.bricks.length > 0);
	assert.ok(first.temperature.bricks.length > 0);
	assert.ok(first.emission.bricks.length > 0);
});

test("combustion creates sparse fuel, heat, absorption, and blackbody channels", () => {
	const length = 4 * 4 * 4;
	const fuel = Array(length).fill(0);
	const density = Array(length).fill(0);
	const temperature = Array(length).fill(0);
	fuel[21] = 0.7;
	density[21] = 0.6;
	temperature[21] = 2;
	const state = createCombustionState3d({
		width: 4,
		height: 4,
		depth: 4,
		fuel: { values: fuel },
		density: { values: density },
		temperature: { values: temperature }
	});
	const artifact = createCombustionVolumeArtifact3d(state, { brickSize: 2 });
	assert.ok(artifact.fuel.bricks.length > 0);
	assert.ok(artifact.absorption.bricks.length > 0);
	assert.ok(artifact.emission.bricks.length > 0);
	assert.equal(artifact.blackbody.enabled, true);
});
