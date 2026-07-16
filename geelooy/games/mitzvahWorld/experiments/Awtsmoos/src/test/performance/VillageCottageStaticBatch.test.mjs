// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageStaticBatch.test.mjs
 * @description Proves repeated cottage shells and roofs share state and merge by region.
 * The Awtsmoos preserves every house while reducing only repeated declarations;
 * Awtsmoos.com tests that room-scale masonry and thick roofs become fewer GPU submissions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageCottageDefinitions } from '../../world/village/VillageCottageDefinitionFactory.js';
import { staticBatchMetadata } from '../../../../light-three-gltf/tiny-static-batch-policy.js';
import { staticBatchGroupKey } from '../../../../light-three-gltf/tiny-static-batch-key.js';

test('equal detail tiers expose batch-stable cottage materials', () => {
	const first = definitionsAt(1, 'near');
	const second = definitionsAt(7, 'near');
	assert.deepEqual(first[0].mapRepeat, second[0].mapRepeat);
	assert.equal(first[0].textureUrl, second[0].textureUrl);
	assert.equal(first[0].mixTextureUrl, second[0].mixTextureUrl);
	assert.deepEqual(first[1].mapRepeat, second[1].mapRepeat);
	assert.equal(first[1].textureUrl, second[1].textureUrl);
	assert.equal(first[1].mixTextureUrl, second[1].mixTextureUrl);
});

test('opaque cottage roofs are certified while transparent and interactive roofs are excluded', () => {
	const roof = mockMesh('reference-village-cottage-roof');
	assert.equal(staticBatchMetadata(roof).family, 'reference-village-cottage-roof');
	assert.equal(staticBatchMetadata(mockMesh('reference-village-cottage-roof', { transparent: true })), null);
	assert.equal(staticBatchMetadata(mockMesh('reference-village-cottage-roof', { interactive: true })), null);
});

test('cottage families use a ninety-six meter batching cell', () => {
	const first = mockMesh('reference-village-district', { x: 4 });
	const second = mockMesh('reference-village-district', { x: 70 });
	const third = mockMesh('reference-village-district', { x: 102 });
	const metadata = { family: 'reference-village-district' };
	assert.equal(staticBatchGroupKey(first, metadata), staticBatchGroupKey(second, metadata));
	assert.notEqual(staticBatchGroupKey(first, metadata), staticBatchGroupKey(third, metadata));
});

function definitionsAt(variant, detail) {
	return createVillageCottageDefinitions({
		base: 0,
		detail,
		id: `test-${variant}`,
		variant,
		x: variant * 3,
		yaw: variant * 0.1,
		z: variant * 2
	}).definitions;
}

function mockMesh(family, options = {}) {
	return {
		geometry: {
			attributes: {
				position: {
					array: new Float32Array([-1, -1, -1, 1, 1, 1]),
					count: 2,
					itemSize: 3
				}
			},
			mode: 4,
			userData: {}
		},
		isSkinnedMesh: false,
		material: {
			opacity: 1,
			transparent: options.transparent || false
		},
		matrixWorld: translationMatrix(options.x || 0),
		name: 'AwtsmoosCottageSurface',
		parent: null,
		userData: {
			family,
			interactive: options.interactive || false
		}
	};
}

function translationMatrix(x) {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, 0, 0, 1
	]);
}
