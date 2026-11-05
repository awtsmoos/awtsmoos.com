// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-native-texture-density.test.mjs
 * @description Proves original pixels produce fractional world-scale repeats without resampling.
 * The Awtsmoos preserves the finite dimensions of every image vessel; Awtsmoos.com verifies
 * that world UVs reveal more or less of that source rather than enlarging or shrinking the source.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	nativeTextureDensityEvidence,
	resolveNativeTextureRepeat
} from '../tiny-native-texture-density.js';
import { textureState } from '../tiny-texture-state.js';

test('world UV density uses exact source width, height, and UV scale', () => {
	const source = image(2048, 1024);
	const repeat = resolveNativeTextureRepeat(source, [9, 9], {
		nativeTexelDensity: true,
		texelsPerWorld: 128,
		tileWorld: 4
	});
	assert.deepEqual(repeat, [0.25, 0.5]);
});

test('normalized surfaces calculate fractional cycles from measured surface size', () => {
	const repeat = resolveNativeTextureRepeat(image(2048, 1024), [1, 1], {
		nativeTexelDensity: true,
		surfaceWorldSize: [8, 4],
		texelsPerWorld: 128
	});
	assert.deepEqual(repeat, [0.5, 0.5]);
});

test('unresolved and opted-out sources preserve authored fallback repetition', () => {
	assert.deepEqual(resolveNativeTextureRepeat(null, [3, 7], { tileWorld: 2 }), [3, 7]);
	assert.deepEqual(resolveNativeTextureRepeat(image(512, 512), [3, 7], {
		nativeTexelDensity: false,
		tileWorld: 2
	}), [3, 7]);
});

test('hydrated texture state recalculates without mutating or resampling the source', () => {
	const source = image(1600, 800);
	const material = {
		mapImage: source,
		mapRepeat: [20, 20],
		texturePolicy: { nativeTexelDensity: true, texelsPerWorld: 100, tileWorld: 2 }
	};
	const state = textureState(material);
	const evidence = nativeTextureDensityEvidence(source, material.mapRepeat, material.texturePolicy);
	assert.equal(state.mapRepeat0, 0.125);
	assert.equal(state.mapRepeat1, 0.25);
	assert.equal(evidence.originalWidth, 1600);
	assert.equal(evidence.originalHeight, 800);
	assert.equal(evidence.resampled, false);
	assert.equal(material.mapImage, source);
});

function image(width, height) {
	return { complete: true, height, width };
}
