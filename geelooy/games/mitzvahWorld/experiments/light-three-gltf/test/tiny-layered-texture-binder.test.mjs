// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-binder.test.mjs
 * @description Proves zero ordinary-material tax and hardware-aware terrain layer capacity.
 * The Awtsmoos fills six vessels on broad hardware and five on a smaller vessel; Awtsmoos.com
 * never makes cottages or Chassidim walk through empty terrain-binding declarations.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LayeredTextureBinder } from '../tiny-layered-texture-binder.js';

test('ordinary materials perform no terrain texture operations', () => {
	const cache = fakeCache(16, 16);
	const binder = new LayeredTextureBinder(cache);
	binder.bind(layerLocations(), {}, [], {});
	assert.deepEqual(cache.calls, []);
});

test('verified hardware binds all six layers to units three through eight', () => {
	const cache = fakeCache(16, 16);
	const binder = new LayeredTextureBinder(cache);
	const stats = {};
	binder.bind(layerLocations(), {}, completeLayers(), stats);
	assert.deepEqual(
		cache.calls.filter(call => call[0] === 'bind').map(call => call[1]),
		[3, 4, 5, 6, 7, 8]
	);
	assert.equal(stats.terrainLayerCapacity, 6);
	assert.equal(stats.terrainLayerTextures, 6);
});

test('eight-unit hardware disables only the sixth excess terrain layer', () => {
	const cache = fakeCache(8, 8);
	const binder = new LayeredTextureBinder(cache);
	const stats = {};
	binder.bind(layerLocations(), {}, completeLayers(), stats);
	assert.equal(cache.calls.filter(call => call[0] === 'bind').length, 5);
	assert.equal(stats.terrainLayerCapacity, 5);
	assert.ok(cache.calls.some(call => (
		call[0] === 'uniform1i'
		&& call[1] === 'use-5'
		&& call[2] === 0
	)));
});

function completeLayers() {
	return Array.from({ length: 6 }, (_, index) => ({
		image: { id: index },
		ready: true,
		repeat0: index + 1,
		repeat1: index + 2,
		strength: 0.5
	}));
}

function layerLocations() {
	return {
		terrainLayers: Array.from({ length: 6 }, (_, index) => ({
			map: `map-${index}`,
			repeat: `repeat-${index}`,
			strength: `strength-${index}`,
			use: `use-${index}`
		}))
	};
}

function fakeCache(fragmentLimit, combinedLimit) {
	const calls = [];
	const gl = {
		MAX_COMBINED_TEXTURE_IMAGE_UNITS: 'combined',
		MAX_TEXTURE_IMAGE_UNITS: 'fragment',
		getParameter(parameter) {
			return parameter === 'fragment' ? fragmentLimit : combinedLimit;
		},
		uniform1f(location, value) {
			calls.push(['uniform1f', location, value]);
		},
		uniform1i(location, value) {
			calls.push(['uniform1i', location, value]);
		},
		uniform2f(location, x, y) {
			calls.push(['uniform2f', location, x, y]);
		}
	};
	return {
		calls,
		defaultTexture: { id: 'default' },
		gl,
		bind(unit, uniform, texture) {
			calls.push(['bind', unit, uniform, texture.id]);
		},
		textureFor(image) {
			return { id: `texture-${image.id}` };
		}
	};
}
