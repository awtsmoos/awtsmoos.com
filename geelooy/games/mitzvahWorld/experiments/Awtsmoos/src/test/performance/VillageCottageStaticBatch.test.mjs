// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageStaticBatch.test.mjs
 * @description Proves realistic cottage materials remain local, hydratable, and batch-stable.
 * The Awtsmoos preserves every house while reducing repeated declarations; Awtsmoos.com tests
 * masonry, slate, and timber through canonical local paths rather than vanished-host query forms.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { villageMaterialPolicy } from '../../world/village/DistanceMaterialPolicy.js';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';
import { staticBatchGroupKey } from '../../../../light-three-gltf/tiny-static-batch-key.js';
import { staticBatchMetadata } from '../../../../light-three-gltf/tiny-static-batch-policy.js';
import { definitionsAt, mockCottageMesh } from './VillageCottageStaticBatchFixtures.mjs';

const COTTAGE_SOURCES = Object.freeze({
	mixRoof: '/full-resolution/tiled roof 2.png',
	mixStone: '/various/Whitewashed stone.png',
	mixWood: '/full-resolution/oak wood 3.png',
	roof: '/various/slate roof shingles.png',
	stone: '/various/Stone retaining wall masonry.png',
	wood: '/various/Rough weathered oak wood planks.png'
});

test('cottage policy resolves the curated alpine local material set exactly', () => {
	const policy = villageMaterialPolicy('near', 11);
	for (const [role, sourcePath] of Object.entries(COTTAGE_SOURCES)) {
		assertLocalMaterialUrl(assert, policy[role], sourcePath);
	}
	assert.equal(policy.texturePolicy.samplersPerSurface, 2);
	assert.equal(policy.texturePolicy.uniqueVillageUrlBudget, 6);
});

test('equal detail tiers expose batch-stable visibly distinct material pairs', () => {
	for (const detail of ['near', 'medium', 'far']) {
		const first = definitionsAt(1, detail);
		const second = definitionsAt(7, detail);
		for (const surfaceIndex of [0, 1]) {
			assert.deepEqual(first[surfaceIndex].mapRepeat, second[surfaceIndex].mapRepeat);
			assert.equal(first[surfaceIndex].textureUrl, second[surfaceIndex].textureUrl);
			assert.equal(first[surfaceIndex].mixTextureUrl, second[surfaceIndex].mixTextureUrl);
			assert.notEqual(first[surfaceIndex].textureUrl, first[surfaceIndex].mixTextureUrl);
			assert.deepEqual(first[surfaceIndex].texturePolicy, second[surfaceIndex].texturePolicy);
		}
	}
});

test('cottage primary surfaces retain distinct base and mix samplers', () => {
	const textured = definitionsAt(3, 'near').filter(definition => {
		return typeof definition.textureUrl === 'string'
			&& typeof definition.mixTextureUrl === 'string';
	});
	assert.ok(textured.length >= 2);
	for (const definition of textured) {
		assert.notEqual(definition.textureUrl, definition.mixTextureUrl);
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
