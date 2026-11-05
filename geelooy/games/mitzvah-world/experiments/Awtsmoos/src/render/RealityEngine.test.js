// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityEngine.test.js
 * @description Proves the reality engine applies atmosphere presets and quality
 * tiers deterministically, and refuses unknown ids with domain errors.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createRealityEngine,
	realityPreset,
	realityPresetIds,
	realityQualityIds
} from './RealityEngine.js';

test('preset ids cover the full day', () => {
	const ids = realityPresetIds();
	for (const expected of ['dawn', 'morning', 'noon', 'golden', 'dusk', 'night', 'storm']) {
		assert.ok(ids.includes(expected), `missing preset ${expected}`);
	}
	const noon = realityPreset('noon');
	assert.ok(noon.sunDirection[1] > 0.8, 'noon sun rides high');
	assert.ok(Object.isFrozen(noon));
});

test('unknown preset and quality ids throw deterministic errors', () => {
	assert.throws(() => realityPreset('eclipse'), /REALITY_PRESET_UNKNOWN:eclipse/);
	const engine = createRealityEngine();
	assert.throws(() => engine.applyPreset('eclipse'), /REALITY_PRESET_UNKNOWN:eclipse/);
	assert.throws(() => engine.setQuality('potato'), /REALITY_QUALITY_UNKNOWN:potato/);
});

test('applyPreset drives setEnvironment with a full atmosphere', () => {
	const seen = [];
	const engine = createRealityEngine({
		environmentTarget: { setEnvironment: values => seen.push(values) }
	});
	const receipt = engine.applyPreset('dusk');
	assert.equal(receipt.presetId, 'dusk');
	assert.equal(seen.length, 1);
	const env = seen[0];
	for (const key of ['ambient', 'sunDirection', 'sunColor', 'fogColor']) {
		assert.ok(Array.isArray(env[key]) && env[key].length === 3, key);
	}
	for (const key of ['fogNear', 'fogFar', 'exposure']) {
		assert.ok(Number.isFinite(env[key]), key);
	}
	assert.equal(engine.describe().presetLabel, 'Dusk');
});

test('quality tiers expose pixel ratio caps and notify listeners', () => {
	const ids = realityQualityIds();
	assert.deepEqual(ids, ['cinematic', 'balanced', 'performance']);
	const notified = [];
	const engine = createRealityEngine({ onQuality: (id, tier) => notified.push([id, tier]) });
	const tier = engine.setQuality('cinematic');
	assert.equal(tier.pixelRatioCap, 2.0);
	assert.deepEqual(notified[0][0], 'cinematic');
	assert.equal(engine.describe().qualityLabel, 'Cinematic');
});

test('engine works headless without a renderer target', () => {
	const engine = createRealityEngine();
	const receipt = engine.applyPreset('night');
	assert.equal(receipt.presetId, 'night');
	assert.equal(engine.skyId?.(), undefined);
});
