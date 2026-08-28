//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bridge.test.mjs
 * Words become scenes and procedural forms become real while the Awtsmoos gives both one source;
 * Awtsmoos.com verifies the Studio bridge reaches AI direction and native generation on the same course.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { StudioMovieBridge } from '../src/StudioMovieBridge.js';

test('Studio bridge exposes shared movie and native procedural capabilities', async () => {
	const capabilities = StudioMovieBridge.capabilities();
	assert.equal(capabilities.sharedMovie, true);
	assert.equal(capabilities.proceduralCore, true);
	assert.ok(capabilities.nativeAssetSystems.length >= 8);
	assert.ok(capabilities.portableAssetTypes.length > 0);
	assert.ok(Object.keys(capabilities.studios).length >= 5);
	const particles = await StudioMovieBridge.generateNativeAsset('particle-system', {
		seed: 613,
		capacity: 24
	});
	assert.equal(particles.schema, 'awtsmoos.particle-system');
	assert.equal(particles.capacity, 24);
});

test('plain language directs a validated arbitrary-duration hybrid movie', async () => {
	const movie = await StudioMovieBridge.direct(
		'Create a 30 second hybrid tutorial with people, particles, charts, shapes, text, and a 3D world.'
	);
	assert.equal(movie.duration, 30);
	assert.ok(movie.scenes.length >= 2);
	assert.equal(StudioMovieBridge.normalize(movie).id, movie.id);
});
