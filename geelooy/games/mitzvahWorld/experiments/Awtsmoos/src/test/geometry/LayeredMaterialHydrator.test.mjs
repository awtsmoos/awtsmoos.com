// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayeredMaterialHydrator.test.mjs
 * @description Proves layer binding never bypasses the shared scene request budget.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hydrateLayeredMaterialImages } from '../../assets/LayeredMaterialHydrator.js';

test('complete layered images are counted without new requests', () => {
	const layers = [
		{ image: completeImage(), role: 'grass', url: 'grass' },
		{ image: completeImage(), role: 'mud', url: 'mud' }
	];
	const root = sceneWithLayers(layers);
	assert.deepEqual(hydrateLayeredMaterialImages(root), {
		bound: 2,
		layers: 2,
		materials: 1,
		pending: 0,
		requested: 0
	});
});

test('missing layers remain pending and issue zero independent requests', () => {
	const layers = Array.from({ length: 6 }, (_, index) => ({
		image: null,
		role: `layer-${index}`,
		url: `https://materials.test/layer-${index}.png`
	}));
	assert.deepEqual(hydrateLayeredMaterialImages(sceneWithLayers(layers)), {
		bound: 0,
		layers: 6,
		materials: 1,
		pending: 6,
		requested: 0
	});
});

function sceneWithLayers(layers) {
	return {
		traverse(callback) {
			callback({ material: { textureLayers: layers } });
			callback({ material: {} });
		}
	};
}

function completeImage() {
	return { complete: true, naturalHeight: 2048, naturalWidth: 2048 };
}
