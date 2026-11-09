// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassBladeField.test.js
 * @description Proves the Chapter 4 Task 4 bounded-blade contract: blades are
 * DISABLED by default (Task 1 has not passed), disabled in survival and low,
 * enabled only behind the explicit flag + profile; only grass tufts within
 * the fade distance become instances, nearest first, capped per tier; the
 * shared wind reader falls back to no sway with no wind state; and the one
 * shared blade material is created at most once across repeated builds.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	TUFT_CLOVER,
	TUFT_FLOWER,
	TUFT_GRASS,
	TUFT_STRIDE,
	placeNearTufts,
	resetBeautyGround
} from './BeautyGround.js';
import {
	BLADE_FADE_NEAR_METERS,
	BLADE_MAX_DISTANCE_METERS,
	applyGrassWind,
	bladeInstanceCap,
	bladesEnabledFor,
	buildGrassBladeField,
	createSharedGrassWind,
	grassBladeMaterialCreateCount,
	grassWindFromMeadowState,
	packageGrassBladeFieldEvidence,
	resetGrassBladeMaterial
} from './GrassBladeField.js';
import { beautyGroundBudget } from './BeautyGround.js';
import { GRASS_WIND_STRENGTH } from '../app/MitzvahWorldGrassMaterial.js';
import {
	createMitzvahWorldWindState,
	mitzvahWorldWindPhaseAt
} from '../world/streaming/MitzvahWorldWindState.js';

const ENABLED = { bladesEnabled: true, worldExperience: { bladeGrass: true } };

function tuftBuffer(entries) {
	const buffer = new Float32Array(entries.length * TUFT_STRIDE);
	entries.forEach((entry, i) => {
		const offset = i * TUFT_STRIDE;
		buffer[offset] = entry.x;
		buffer[offset + 1] = entry.y || 0;
		buffer[offset + 2] = entry.z || 0;
		buffer[offset + 3] = entry.scale ?? 1;
		buffer[offset + 4] = entry.type ?? TUFT_GRASS;
		buffer[offset + 5] = entry.yaw || 0;
	});
	return { buffer, count: entries.length };
}

function fakeFactory() {
	const calls = [];
	const createMaterial = (options) => {
		calls.push(options);
		return { fake: true, options };
	};
	return { calls, createMaterial };
}

test('blades are disabled by default: no flag, no field, no material', () => {
	resetGrassBladeMaterial();
	resetBeautyGround();
	assert.equal(bladesEnabledFor({}), false);
	assert.equal(bladesEnabledFor({ quality: 'high' }), false);
	assert.equal(bladesEnabledFor({ bladesEnabled: true, quality: 'high' }), false, 'flag without profile is not enough');
	assert.equal(bladesEnabledFor({ quality: 'high', worldExperience: { bladeGrass: true } }), false, 'profile without flag is not enough');
	const { buffer, count } = tuftBuffer([{ x: 1, z: 1 }, { x: 2, z: 2 }]);
	const factory = fakeFactory();
	const field = buildGrassBladeField({ buffer, count, createMaterial: factory.createMaterial, quality: 'high' });
	assert.equal(field.enabled, false);
	assert.equal(field.count, 0);
	assert.equal(field.matrices.length, 0);
	assert.equal(field.material, null);
	assert.equal(factory.calls.length, 0, 'disabled field must not create a material');
	assert.equal(grassBladeMaterialCreateCount(), 0);
});

test('blades stay disabled in survival even with the explicit flag', () => {
	assert.equal(bladesEnabledFor({ ...ENABLED, quality: 'survival' }), false);
	assert.equal(bladesEnabledFor({ ...ENABLED, qualityProfile: { quality: 'survival' } }), false);
	assert.equal(bladesEnabledFor({ ...ENABLED, quality: 'survival', worldExperience: { bladeGrass: true } }), false);
	const { buffer, count } = tuftBuffer([{ x: 1, z: 1 }]);
	const field = buildGrassBladeField({ buffer, count, options: { ...ENABLED, quality: 'survival' }, quality: 'survival' });
	assert.equal(field.enabled, false);
	assert.equal(field.count, 0);
});

test('blades stay disabled in low: low mode is attractive on texture alone', () => {
	assert.equal(bladesEnabledFor({ ...ENABLED, quality: 'low' }), false);
	const { buffer, count } = tuftBuffer([{ x: 1, z: 1 }]);
	const field = buildGrassBladeField({ buffer, count, options: ENABLED, quality: 'low' });
	assert.equal(field.enabled, false);
	assert.equal(field.count, 0);
});

test('blades build from real BeautyGround tufts only when explicitly enabled', () => {
	resetGrassBladeMaterial();
	resetBeautyGround();
	const { buffer, count } = placeNearTufts(0, 0, () => 0, 'high');
	const factory = fakeFactory();
	const field = buildGrassBladeField({
		buffer,
		count,
		createMaterial: factory.createMaterial,
		options: ENABLED,
		quality: 'high'
	});
	assert.equal(field.enabled, true);
	assert.ok(field.count > 0, 'expected blades from a real tuft ring');
	// Count the grass tufts in range straight from the pooled buffer: the
	// field must keep min(grass in range, tier cap), nearest first.
	let grassInRange = 0;
	for (let i = 0; i < count; i += 1) {
		const offset = i * TUFT_STRIDE;
		if (buffer[offset + 4] !== TUFT_GRASS) continue;
		const distance = Math.sqrt(buffer[offset] ** 2 + buffer[offset + 2] ** 2);
		if (distance <= BLADE_MAX_DISTANCE_METERS) grassInRange += 1;
	}
	assert.ok(grassInRange > bladeInstanceCap('high'), `cap must bind: only ${grassInRange} grass tufts in range`);
	assert.equal(field.count, bladeInstanceCap('high'), 'nearest-first cap binds at the tier cap');
	assert.equal(field.count, 260);
	assert.ok(field.maxDistance <= BLADE_MAX_DISTANCE_METERS, `max distance ${field.maxDistance} past fade`);
	assert.ok(field.maxDistance <= 25);
	assert.equal(field.matrices.length, field.count * 16);
	assert.ok(field.material && field.material.fake, 'shared blade material should be created once');
	assert.equal(factory.calls.length, 1);
	assert.equal(grassBladeMaterialCreateCount(), 1);
	// The shared material carries the no-shadow, shared-wind policy.
	const policy = factory.calls[0].texturePolicy;
	assert.equal(policy.castShadow, false);
	assert.equal(policy.receiveShadow, false);
	assert.equal(policy.wind.mode, 'shared-uniform');
	assert.equal(BLADE_FADE_NEAR_METERS, 12);
	assert.equal(BLADE_MAX_DISTANCE_METERS, 25);
});

test('only grass tufts within the fade distance become blades, nearest first', () => {
	resetGrassBladeMaterial();
	// Grass at 5m and 24m kept; grass at 26m and 100m dropped; flower/clover at 5m dropped.
	const entries = [
		{ x: 5, z: 0 },
		{ x: 24, z: 0 },
		{ x: 26, z: 0 },
		{ x: 100, z: 0 },
		{ type: TUFT_FLOWER, x: 5, z: 0 },
		{ type: TUFT_CLOVER, x: 5, z: 0 }
	];
	const { buffer, count } = tuftBuffer(entries);
	const field = buildGrassBladeField({ buffer, count, options: ENABLED, quality: 'high' });
	assert.equal(field.count, 2, 'only the two in-range grass tufts');
	assert.ok(field.maxDistance <= 25 && field.maxDistance >= 24);
	// Instance translations carry the kept tuft positions (column-major offset 12/14).
	const xs = [];
	for (let slot = 0; slot < field.count; slot += 1) xs.push(field.matrices[slot * 16 + 12]);
	assert.deepEqual([...xs].sort((a, b) => a - b), [5, 24]);
});

test('tier caps bind and drop the farthest blades first', () => {
	resetGrassBladeMaterial();
	const entries = [];
	for (let i = 0; i < 500; i += 1) entries.push({ x: 5 + (i % 20), z: 0 });
	const { buffer, count } = tuftBuffer(entries);
	const field = buildGrassBladeField({ buffer, count, options: ENABLED, quality: 'high' });
	assert.equal(field.count, 260);
	// All 25 tufts at 5m survive (nearest first); the farthest 20m tufts are the ones dropped.
	const xs = [];
	for (let slot = 0; slot < field.count; slot += 1) xs.push(field.matrices[slot * 16 + 12]);
	assert.equal(xs.filter(x => x === 5).length, 25);
	assert.ok(Math.max(...xs) < 20, 'farthest blades should be dropped first');
	const medium = buildGrassBladeField({ buffer, count, options: ENABLED, quality: 'medium' });
	assert.equal(medium.count, 160);
	assert.equal(bladeInstanceCap('cinematic'), 360);
	assert.equal(bladeInstanceCap('low'), 0);
});

test('blade field is deterministic and the material stays a singleton across rebuilds', () => {
	resetGrassBladeMaterial();
	resetBeautyGround();
	const { buffer, count } = placeNearTufts(3, -3, () => 0, 'medium');
	const factory = fakeFactory();
	const first = buildGrassBladeField({
		buffer, count, createMaterial: factory.createMaterial, options: ENABLED, quality: 'medium'
	});
	const second = buildGrassBladeField({
		buffer, count, createMaterial: factory.createMaterial, options: ENABLED, quality: 'medium'
	});
	assert.deepEqual([...second.matrices], [...first.matrices]);
	assert.equal(second.material, first.material, 'repeated chunk reloads reuse the same material');
	assert.equal(factory.calls.length, 1);
	assert.equal(grassBladeMaterialCreateCount(), 1);
	// Clusters partition the kept blades.
	const total = second.clusters.reduce((sum, cluster) => sum + cluster.tuftCount, 0);
	assert.equal(total, second.count);
});

test('wind reader: no wind state means no sway, never a crash', () => {
	const reading = grassWindFromMeadowState(null, null);
	assert.equal(reading.strength, 0);
	assert.equal(reading.phase, 0);
	assert.equal(reading.seed, null);
	// Direction is the normalized default (0.8, 0.6), which is already unit length.
	assert.equal(reading.directionX, 0.8);
	assert.equal(reading.directionZ, 0.6);
	assert.equal(grassWindFromMeadowState(undefined, undefined).strength, 0);
});

test('wind reader: per-chunk meadow state supplies phase and seed', () => {
	const reading = grassWindFromMeadowState({ seed: 7, windPhase: 0.25 }, null);
	assert.equal(reading.phase, 0.25);
	assert.equal(reading.seed, 7);
	assert.ok(reading.strength > 0, 'a live meadow state means a default breeze, not still air');
	// Calm-air factor 0.54 with no gust, matching SharedWindField's bend law.
	assert.ok(Math.abs(reading.strength - GRASS_WIND_STRENGTH * 0.54) < 1e-12, `got ${reading.strength}`);
});

test('wind reader: Task 3 shared wind state plugs in directly, phase agrees', () => {
	// THE shared wind state from Task 3 (seed + windPhase, same phase law
	// as MeadowChunkSimulation) is accepted as-is — no second wind clock.
	const windState = createMitzvahWorldWindState(4242, 90);
	const reading = grassWindFromMeadowState(windState, null);
	assert.equal(reading.seed, 4242);
	assert.equal(reading.phase, mitzvahWorldWindPhaseAt(4242, 90));
	assert.ok(reading.strength > 0);
	// A state carrying only a seed normalizes to the seed-derived phase.
	const seedOnly = grassWindFromMeadowState({ seed: 4242 }, null);
	assert.equal(seedOnly.phase, mitzvahWorldWindPhaseAt(4242, 0));
});

test('wind reader: shared field snapshot supplies direction, gust, and flutter', () => {
	const reading = grassWindFromMeadowState(
		{ seed: 11, windPhase: 0.5 },
		{ directionX: 0, directionZ: -2, flutter: 0.2, gust: 0.5, strength: 1.5 }
	);
	assert.equal(reading.directionX, 0);
	assert.equal(reading.directionZ, -1);
	assert.equal(reading.phase, 0.5);
	const expected = GRASS_WIND_STRENGTH * 1.5 * (0.54 + 0.5 * 0.38) + 0.2 * GRASS_WIND_STRENGTH * 0.08;
	assert.ok(Math.abs(reading.strength - expected) < 1e-12, `got ${reading.strength}, expected ${expected}`);
});

test('one shared wind uniform carries the reading once per frame', () => {
	const wind = createSharedGrassWind();
	const reading = grassWindFromMeadowState({ seed: 3, windPhase: 0.75 }, { directionX: 1, directionZ: 0, gust: 0, strength: 1 });
	const uniform = applyGrassWind(wind, reading, 12.5);
	assert.equal(uniform.time, 12.5);
	assert.equal(uniform.directionX, 1);
	assert.equal(uniform.directionZ, 0);
	assert.ok(uniform.strength > 0);
	assert.equal(uniform, wind.uniform, 'the uniform object itself is shared');
});

test('evidence proves the bounded blade contract', () => {
	const good = packageGrassBladeFieldEvidence({
		beautyBudget: beautyGroundBudget('high').tufts,
		cap: bladeInstanceCap('high'),
		count: 260,
		cullDistance: 145,
		enabled: true,
		materialCreateCount: 1,
		maxDistance: 24.9,
		options: ENABLED,
		quality: 'high'
	});
	assert.equal(good.ok, true);
	const survivalBad = packageGrassBladeFieldEvidence({
		cap: 260,
		count: 10,
		enabled: true,
		materialCreateCount: 1,
		maxDistance: 10,
		options: { ...ENABLED, quality: 'survival' },
		quality: 'survival'
	});
	assert.equal(survivalBad.ok, false);
	assert.equal(survivalBad.checks.disabledInSurvival, false);
	const overCap = packageGrassBladeFieldEvidence({
		cap: 260,
		count: 261,
		enabled: true,
		materialCreateCount: 1,
		maxDistance: 10,
		options: ENABLED,
		quality: 'high'
	});
	assert.equal(overCap.ok, false);
	assert.equal(overCap.checks.bladeCapRespected, false);
});
