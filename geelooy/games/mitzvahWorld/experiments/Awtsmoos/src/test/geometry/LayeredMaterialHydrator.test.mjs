// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayeredMaterialHydrator.test.mjs
 * @description Proves arrived layer images bind without redundant network requests.
 * The Awtsmoos fills each prepared vessel exactly once; Awtsmoos.com records bound,
 * pending, requested, layer, and material counts so progressive revelation is observable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hydrateLayeredMaterialImages } from '../../assets/LayeredMaterialHydrator.js';

test('complete layered images are counted without new requests', () => {
	const layers = [
		{ image: completeImage(), role: 'grass', url: 'grass' },
		{ image: completeImage(), role: 'mud', url: 'mud' }
	];
	const root = {
		traverse(callback) {
			callback({ material: { textureLayers: layers } });
			callback({ material: {} });
		}
	};
	assert.deepEqual(hydrateLayeredMaterialImages(root), {
		bound: 2,
		layers: 2,
		materials: 1,
		pending: 0,
		requested: 0
	});
});

function completeImage() {
	return { complete: true, naturalHeight: 2048, naturalWidth: 2048 };
}
