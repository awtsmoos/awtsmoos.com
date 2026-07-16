// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-state.test.mjs
 * @description Proves ordinary materials stay empty while ten rich layers compare exactly.
 * The Awtsmoos joins only truly equal garments; Awtsmoos.com detects image, readiness,
 * repeat, ecology, height, slope, rotation, strength, and wetness without blank ordinary state.
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

test('ten complete layers compare by exact shader-visible state', () => {
	const material = { textureLayers: createLayers() };
	const first = layeredTextureState(material);
	const second = layeredTextureState(material);
	assert.equal(first.length, 10);
	assert.ok(first.every(layer => layer.ready));
	assert.equal(sameLayeredTextureState(first, second), true);
	second[2] = { ...second[2], wetness: 0.12 };
	assert.equal(sameLayeredTextureState(first, second), false);
});

test('missing logical layers become disabled default shader records', () => {
	const state = layeredTextureState({ textureLayers: createLayers().slice(0, 3) });
	assert.equal(state.length, 10);
	assert.equal(state[2].ready, true);
	assert.equal(state[3].ready, false);
	assert.deepEqual(state[3].zones, [1, 1, 1, 1]);
});

function createLayers() {
	return Array.from({ length: 10 }, (_, index) => ({
		angle: index * 0.17,
		height: [-20 + index, 80 + index],
		image: { complete: true, naturalHeight: 4096, naturalWidth: 4096 },
		repeat: [index + 1, index + 2],
		role: `layer-${index}`,
		slope: [index * 0.02, 0.55 + index * 0.03],
		strength: 0.4 + index * 0.04,
		wetness: index * 0.05,
		zones: [1, index % 2, (index + 1) % 2, index / 10]
	}));
}
