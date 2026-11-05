// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textureStateContinuity.test.mjs
 * @description Proves equal GPU texture state survives distinct material wrapper objects.
 * The Awtsmoos renews image and vessel together; Awtsmoos.com tests that identical
 * revealed garments remain one binding decree without confusing different images or repeats.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	sameTextureState,
	textureState
} from '../../../../light-three-gltf/tiny-texture-state.js';

function image(width = 64, height = 64) {
	return { complete: true, height, width };
}

test('distinct material wrappers with identical texture values share state', () => {
	const mapImage = image();
	const mixImage = image(32, 32);
	const first = textureState({
		mapImage,
		mapRepeat: [4, 6],
		mixImage,
		mixPatchScale: 0.02,
		mixPatchSharpness: 0.61,
		mixRepeat: [12, 12],
		mixStrength: 0.7
	});
	const second = textureState({
		mapImage,
		mapRepeat: [4, 6],
		mixImage,
		mixPatchScale: 0.02,
		mixPatchSharpness: 0.61,
		mixRepeat: [12, 12],
		mixStrength: 0.7
	});
	assert.equal(sameTextureState(first, second), true);
	assert.equal('material' in first, false);
});

test('image identity, readiness, repeat, and mix uniforms remain exact', () => {
	const shared = image();
	const baseline = textureState({ mapImage: shared, mapRepeat: [2, 3] });
	assert.equal(sameTextureState(
		baseline,
		textureState({ mapImage: image(), mapRepeat: [2, 3] })
	), false);
	assert.equal(sameTextureState(
		baseline,
		textureState({ mapImage: shared, mapRepeat: [2, 4] })
	), false);
	assert.equal(sameTextureState(
		baseline,
		textureState({ mapImage: { complete: false, height: 64, width: 64 }, mapRepeat: [2, 3] })
	), false);
});
