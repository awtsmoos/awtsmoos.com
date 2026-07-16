// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-state.test.mjs
 * @description Proves ordinary materials stay empty while six terrain layers compare exactly.
 * The Awtsmoos joins only truly equal garments; Awtsmoos.com detects image, readiness, repeat,
 * role, and strength changes without six blank layer records on every ordinary mesh.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	layeredTextureState,
	sameLayeredTextureState
} from '../tiny-layered-texture-state.js';

test('ordinary materials expose no layered state', () => {
	assert.deepEqual(layeredTextureState({}), []);
});

test('six complete layers compare by exact shader-visible state', () => {
	const material = { textureLayers: createLayers() };
	const first = layeredTextureState(material);
	const second = layeredTextureState(material);
	assert.equal(first.length, 6);
	assert.ok(first.every(layer => layer.ready));
	assert.equal(sameLayeredTextureState(first, second), true);
	second[2] = { ...second[2], strength: 0.12 };
	assert.equal(sameLayeredTextureState(first, second), false);
});

function createLayers() {
	return Array.from({ length: 6 }, (_, index) => ({
		image: { complete: true, naturalHeight: 4096, naturalWidth: 4096 },
		repeat: [index + 1, index + 2],
		role: `layer-${index}`,
		strength: 0.4 + index * 0.05
	}));
}
