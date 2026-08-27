// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state-cache.test.mjs
 * @description Proves stable native-density texture state is reused and real hydration invalidates it.
 * The Awtsmoos renews every image without stretching it; Awtsmoos.com reuses exact state until
 * source readiness, authored repeat, physical policy, or ecological layer truth actually changes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	textureState,
	textureStateCacheDiagnostics
} from '../tiny-texture-state.js';

test('unchanged material returns the identical frozen texture state', () => {
	const material = { mapRepeat: [2, 3] };
	const before = textureStateCacheDiagnostics();
	const first = textureState(material);
	const second = textureState(material);
	const after = textureStateCacheDiagnostics();
	assert.strictEqual(second, first);
	assert.equal(Object.isFrozen(first), true);
	assert.ok(after.hits > before.hits);
	assert.ok(after.misses > before.misses);
});

test('hydration and authored repeat changes each rebuild exactly once', () => {
	const material = {
		mapRepeat: [1, 1],
		texturePolicy: {
			nativeTexelDensity: true,
			surfaceWorldSize: [4, 2],
			texelsPerWorld: 256
		}
	};
	const empty = textureState(material);
	material.mapImage = readyImage(1024, 512);
	const hydrated = textureState(material);
	const stable = textureState(material);
	material.mapRepeat = [2, 1];
	const repeated = textureState(material);
	assert.notStrictEqual(hydrated, empty);
	assert.strictEqual(stable, hydrated);
	assert.notStrictEqual(repeated, hydrated);
	assert.equal(hydrated.mapReady, true);
});

test('one ecological layer image invalidates the layered state', () => {
	const layer = {
		height: [-10, 10],
		repeat: [3, 3],
		role: 'meadow',
		slope: [0, 0.5],
		strength: 1,
		zones: [1, 0, 0, 0]
	};
	const material = { textureLayers: [layer] };
	const before = textureState(material);
	layer.image = readyImage(2048, 2048);
	const after = textureState(material);
	assert.notStrictEqual(after, before);
	assert.equal(after.layers[0].ready, true);
});

function readyImage(width, height) {
	return { complete: true, naturalHeight: height, naturalWidth: width };
}
