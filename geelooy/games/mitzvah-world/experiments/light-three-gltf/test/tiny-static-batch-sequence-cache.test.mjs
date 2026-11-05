// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batch-sequence-cache.test.mjs
 * @description Proves stable static candidates skip regrouping while real material changes rebuild.
 * The Awtsmoos joins fixed cottages through enduring identity; Awtsmoos.com reuses one merged
 * village vessel until texture, tint, transform, geometry, or render-distance truth changes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MeshStandardMaterial } from '../tiny-runtime.js';
import { StaticOpaqueBatcher } from '../tiny-static-opaque-batcher.js';
import {
	collect,
	createScene,
	readyImage,
	triangle
} from './tiny-static-batching-fixtures.mjs';

test('second identical collection reuses the exact prior batch result', () => {
	const material = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	const scene = createScene([
		triangle(material, 1, 'reference-village-district'),
		triangle(material, 2, 'reference-village-district')
	]);
	const batcher = new StaticOpaqueBatcher();
	const first = collect(scene, batcher);
	const second = collect(scene, batcher);
	assert.strictEqual(second.opaque[0], first.opaque[0]);
	assert.equal(second.staticBatch.cacheBuilds, 1);
	assert.equal(second.staticBatch.sequenceReuses, 1);
	assert.equal(second.staticBatch.sequence.hits, 1);
});

test('real hydration invalidates the sequence and rebuilds one batch', () => {
	const material = new MeshStandardMaterial({ color: [0.9, 0.9, 0.9, 1] });
	material.textureUrl = 'https://materials.test/stone.png';
	const scene = createScene([
		triangle(material, 1, 'reference-village-district'),
		triangle(material, 2, 'reference-village-district')
	]);
	const batcher = new StaticOpaqueBatcher();
	const first = collect(scene, batcher);
	material.mapImage = readyImage(1024, 1024);
	const second = collect(scene, batcher);
	assert.notStrictEqual(second.opaque[0], first.opaque[0]);
	assert.equal(second.staticBatch.cacheBuilds, 2);
	assert.equal(second.staticBatch.sequence.misses, 1);
	assert.equal(second.staticBatch.sequence.captures, 2);
});
