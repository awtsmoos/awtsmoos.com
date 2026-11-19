// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapGrassSoftness.test.js
 * @description Round-6 grass regression guard: the meadow ground texture must
 * stay soft. The pre-round-6 painter's patch/blade contrast measured a mean
 * neighbor difference of 1.75 and read as a harsh repetitive scribble at
 * tiling scale; the softened painter measures ~0.93. This test fails if the
 * grass pattern grows harsh again, and also fails if it goes flat (the
 * meadow must keep living variation).
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	generateProceduralTexture,
	PROCEDURAL_TEXTURE_SEED
} from './BootstrapProceduralTerrainTextures.js';

function meanNeighborDifference(texture) {
	const { data, width } = texture;
	let sum = 0;
	let count = 0;
	for (let y = 0; y < texture.height; y += 1) {
		for (let x = 0; x < width - 1; x += 1) {
			const i = (y * width + x) * 4;
			sum += Math.abs(data[i] - data[i + 4])
				+ Math.abs(data[i + 1] - data[i + 5])
				+ Math.abs(data[i + 2] - data[i + 6]);
			count += 1;
		}
	}
	return sum / count;
}

test('grass texture pattern stays soft, never scribble, never flat', () => {
	const texture = generateProceduralTexture('grass', PROCEDURAL_TEXTURE_SEED);
	const mean = meanNeighborDifference(texture);
	assert.ok(mean < 1.3, `grass pattern too harsh: mean neighbor diff ${mean}`);
	assert.ok(mean > 0.3, `grass pattern went flat: mean neighbor diff ${mean}`);
});
