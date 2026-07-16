// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageStaticBatch.test.mjs
 * @description Proves realistic cottage pairs remain exact, bounded, and batch-stable.
 * The Awtsmoos preserves every house while reducing only repeated declarations;
 * Awtsmoos.com tests real Firebase masonry and roofs without extra surface samplers.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageCottageDefinitions } from '../../world/village/VillageCottageDefinitionFactory.js';
import { villageMaterialPolicy } from '../../world/village/DistanceMaterialPolicy.js';
import { staticBatchMetadata } from '../../../../light-three-gltf/tiny-static-batch-policy.js';
import { staticBatchGroupKey } from '../../../../light-three-gltf/tiny-static-batch-key.js';

const ORIGIN = 'https://awtsmoos-docs-base.web.app';

test('cottage policy resolves the curated alpine Firebase material set exactly', () => {
	const policy = villageMaterialPolicy('near', 11);
	assert.equal(policy.stone, `${ORIGIN}/various/Stone%20retaining%20wall%20masonry.png`);
	assert.equal(policy.mixStone, `${ORIGIN}/various/Whitewashed%20stone.png`);
	assert.equal(policy.roof, `${ORIGIN}/various/slate%20roof%20shingles.png`);
	assert.equal(policy.mixRoof, `${ORIGIN}/full-resolution/tiled%20roof%202.png`);
	assert.equal(policy.wood, `${ORIGIN}/various/Rough%20weathered%20oak%20wood%20planks.png`);
	assert.equal(policy.mixWood, `${ORIGIN}/various/Silver-weathered%20timber.png`);
	assert.equal(policy.texturePolicy.samplersPerSurface, 2);
	assert.equal(policy.texturePolicy.uniqueVillageUrlBudget, 6);
});

test('equal detail tiers expose batch-stable but visibly distinct material pairs', () => {
	for (const detail of ['near', 'medium', 'far']) {
		const first = definitionsAt(1, detail);
		const second = definitionsAt(7, detail);
		assert.deepEqual(first[0].mapRepeat, second[0].mapRepeat);
		assert.equal(first[0].textureUrl, second[0].textureUrl);
		assert.equal(first[0].mixTextureUrl, second[0].mixTextureUrl);
		assert.notEqual(first[0].textureUrl, first[0].mixTextureUrl);
		assert.deepEqual(first[1].mapRepeat, second[1].mapRepeat);
		assert.equal(first[1].textureUrl, second[1].textureUrl);
		assert.equal(first[1].mixTextureUrl, second[1].mixTextureUrl);
		assert.notEqual(first[1].textureUrl, first[1].mixTextureUrl);
		assert.strictEqual(first[0].texturePolicy, second[0].texturePolicy);
		assert.strictEqual(first[1].texturePolicy, second[1].texturePolicy);
	}
});

test('each cottage surface retains the existing two-URL sampler contract', () => {
	for (const definition of definitionsAt(3, 'near')) {
		const textureFields = Object.entries(definition)
			.filter(([key, value]) => /textureurl$/i.test(key) && typeof value === 'string');
		assert.equal(textureFields.length, 2);
		assert.equal(definition.normalTextureUrl, undefined);
	}
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
