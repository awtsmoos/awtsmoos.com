// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-batching.test.mjs
 * @description Proves eligibility, tint baking, broad cells, and hydration refresh.
 * The Awtsmoos joins static forms while every garment remains alive; Awtsmoos.com rebuilds
 * only when a real map, tint, transform, or shader-visible covenant changes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MeshStandardMaterial } from '../tiny-runtime.js';
import { StaticOpaqueBatcher } from '../tiny-static-opaque-batcher.js';
import {
	collect,
	createScene,
	material,
	readyImage,
	triangle
} from './tiny-static-batching-fixtures.mjs';

test('static cottages merge while moving and transparent meshes remain separate', () => {
	const shared = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	const moving = triangle(shared, 3, 'reference-village-district');
	moving.name = 'animated-chossid';
	const water = new MeshStandardMaterial({ color: [0.2, 0.5, 0.8, 0.7] });
	water.transparent = true;
	water.alphaMode = 'BLEND';
	const scene = createScene([
		triangle(shared, 1, 'reference-village-district'),
		triangle(shared, 2, 'reference-village-district'),
		moving,
		triangle(water, 0, 'reference-arrival-composition')
	]);
	const result = collect(scene, new StaticOpaqueBatcher());
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.equal(result.staticBatch.savedDraws, 1);
	assert.equal(result.opaque.length, 2);
	assert.equal(result.transparent.length, 1);
	assert.ok(result.opaque.includes(moving));
});

test('different static tints merge into exact baked vertex colors', () => {
	const mapImage = readyImage(64, 64);
	const scene = createScene([
		triangle(material([0.8, 0.25, 0.2, 1], mapImage), 1, 'functional-house', [0.5, 0.8, 1, 1]),
		triangle(material([0.2, 0.75, 0.3, 1], mapImage), 2, 'village-static-props', [0.5, 0.8, 1, 1])
	]);
	const result = collect(scene, new StaticOpaqueBatcher());
	const batch = result.opaque[0];
	assert.equal(result.staticBatch.batchedSourceMeshes, 2);
	assert.deepEqual(batch.material.color, [1, 1, 1, 1]);
	assert.equal(batch.material.mapImage, mapImage);
	const colors = Array.from(batch.geometry.attributes.color.array);
	assertApprox(colors.slice(0, 4), [0.4, 0.2, 0.2, 1]);
	assertApprox(colors.slice(12, 16), [0.1, 0.6, 0.3, 1]);
});

test('384-unit cells preserve a separately culled far quadrant', () => {
	const shared = new MeshStandardMaterial({ color: [0.7, 0.6, 0.5, 1] });
	const scene = createScene([1, 2, 398, 399].map(x => (
		triangle(shared, x, 'reference-village-district')
	)));
	const result = collect(scene, new StaticOpaqueBatcher(), 500);
	assert.equal(result.staticBatch.batchMeshes, 2);
	assert.equal(result.staticBatch.batchedSourceMeshes, 4);
	assert.equal(result.opaque.length, 1);
	assert.equal(result.culled.distance + result.culled.frustum, 1);
});

test('same static meshes rebuild after their real cottage map hydrates', () => {
	const batcher = new StaticOpaqueBatcher();
	const shared = material([0.9, 0.9, 0.9, 1]);
	shared.textureUrl = 'https://materials.test/cottage-stone.png';
	const scene = createScene([
		triangle(shared, 1, 'reference-village-district'),
		triangle(shared, 2, 'reference-village-district')
	]);
	const first = collect(scene, batcher).opaque[0];
	const image = readyImage(1024, 1024);
	shared.mapImage = image;
	const secondResult = collect(scene, batcher);
	const second = secondResult.opaque[0];
	assert.notStrictEqual(second, first);
	assert.strictEqual(second.material.mapImage, image);
	assert.equal(secondResult.staticBatch.cacheBuilds, 2);
});

function assertApprox(actual, expected) {
	for (let index = 0; index < expected.length; index += 1) {
		assert.ok(Math.abs(actual[index] - expected[index]) < 0.000001);
	}
}
