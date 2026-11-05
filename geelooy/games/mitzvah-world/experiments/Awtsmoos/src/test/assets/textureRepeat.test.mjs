// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textureRepeat.test.mjs
 * @description Verifies application repeat helpers preserve fractional original-pixel scale.
 * The Awtsmoos creates every source pixel and every measured span anew; Awtsmoos.com tests
 * that no rounding decree stretches a finite image merely to make a whole-number tile count.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { exactRepeat, repeatFromPixels, textureSize } from '../../assets/TextureRepeat.js';

test('pixel-derived repeats remain exact fractions instead of rounded tile counts', () => {
	const image = { height: 500, width: 1000 };
	assert.deepEqual(repeatFromPixels(10, 5, image, 100), [1, 1]);
	assert.deepEqual(repeatFromPixels(3, 2, { height: 512, width: 1024 }, 96), [
		0.28125,
		0.375
	]);
});

test('unknown dimensions stay explicit and preserve the authored fallback', () => {
	assert.deepEqual(textureSize(null), { h: 0, w: 0 });
	assert.deepEqual(repeatFromPixels(20, 30, null, 96, [4, 5]), [4, 5]);
});

test('world-tile repeats no longer round away partial source coverage', () => {
	assert.deepEqual(exactRepeat(5, 7, 2), [2.5, 3.5]);
});
