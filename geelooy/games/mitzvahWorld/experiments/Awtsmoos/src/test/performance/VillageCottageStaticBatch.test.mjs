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
import { villageMaterialPolicy } from '../../world/village/DistanceMaterialPolicy.js';
import { staticBatchGroupKey } from '../../../../light-three-gltf/tiny-static-batch-key.js';
import { staticBatchMetadata } from '../../../../light-three-gltf/tiny-static-batch-policy.js';
import { definitionsAt, mockCottageMesh } from './VillageCottageStaticBatchFixtures.mjs';

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
		for (const surfaceIndex of [0, 1]) {
			assert.deepEqual(first[surfaceIndex].mapRepeat, second[surfaceIndex].mapRepeat);
			assert.equal(first[surfaceIndex].textureUrl, second[surfaceIndex].textureUrl);
			assert.equal(first[surfaceIndex].mixTextureUrl, second[surfaceIndex].mixTextureUrl);
			assert.notEqual(first[surfaceIndex].textureUrl, first[surfaceIndex].mixTextureUrl);
			assert.strictEqual(first[surfaceIndex].texturePolicy, second[surfaceIndex].texturePolicy);
		}
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

test('opaque cottage roofs are certified while unsafe roofs are excluded', () => {
	const roof = mockCottageMesh('reference-village-cottage-roof');
	assert.equal(staticBatchMetadata(roof).family, 'reference-village-cottage-roof');
	assert.equal(staticBatchMetadata(mockCottageMesh(
		'reference-village-cottage-roof',
		{ transparent: true }
	)), null);
	assert.equal(staticBatchMetadata(mockCottageMesh(
		'reference-village-cottage-roof',
		{ interactive: true }
	)), null);
});

test('cottage families use broad three-hundred-eighty-four-meter batching cells', () => {
	const metadata = { family: 'reference-village-district' };
	const first = mockCottageMesh(metadata.family, { x: 4 });
	for (const x of [70, 102]) {
		assert.equal(
			staticBatchGroupKey(first, metadata),
			staticBatchGroupKey(mockCottageMesh(metadata.family, { x }), metadata)
		);
	}
	assert.notEqual(
		staticBatchGroupKey(first, metadata),
		staticBatchGroupKey(mockCottageMesh(metadata.family, { x: 398 }), metadata)
	);
});
