// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionChildLayout.test.mjs
 * @description Proves eight exact octants, stable IDs, coordinates, seeds, and volume.
 * The Awtsmoos reveals eight bounded vessels from one parent without adding a gap;
 * Awtsmoos.com checks every midpoint, coordinate, and deterministic seed directly.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createWorldChunkId,
	parseWorldChunkId
} from '../../world/streaming/WorldChunkId.js';
import {
	createWorldChunkCollisionChildLayout,
	WORLD_CHUNK_COLLISION_CHILD_COUNT
} from '../../world/streaming/WorldChunkCollisionChildLayout.js';

function createLayout() {
	return createWorldChunkCollisionChildLayout({
		parentId: createWorldChunkId({
			namespace: 'child-layout',
			level: 2,
			x: -1,
			y: 3,
			z: 4
		}),
		parentBounds: {
			min: { x: -8, y: -4, z: -12 },
			max: { x: 8, y: 12, z: 4 }
		},
		parentSeed: 77,
		generationVersion: 5
	});
}

test('layout creates eight exact positive-volume octants', () => {
	const layout = createLayout();
	assert.equal(layout.children.length, WORLD_CHUNK_COLLISION_CHILD_COUNT);
	assert.equal(layout.coverage.parentVolume, 4096);
	assert.equal(layout.coverage.childVolume, 4096);
	assert.equal(layout.coverage.childCount, 8);
	assert.deepEqual(layout.children[0].bounds, {
		min: { x: -8, y: -4, z: -12 },
		max: { x: 0, y: 4, z: -4 }
	});
	assert.deepEqual(layout.children[7].bounds, {
		min: { x: 0, y: 4, z: -4 },
		max: { x: 8, y: 12, z: 4 }
	});
});

test('child coordinates and IDs derive from parent octant bits', () => {
	const layout = createLayout();
	for (const child of layout.children) {
		const parsed = parseWorldChunkId(child.chunkId);
		assert.equal(parsed.namespace, 'child-layout');
		assert.equal(parsed.level, 3);
		assert.equal(parsed.x, -2 + (child.octant & 1));
		assert.equal(parsed.y, 6 + ((child.octant >> 1) & 1));
		assert.equal(parsed.z, 8 + ((child.octant >> 2) & 1));
		assert.deepEqual(parsed.x, child.coordinates.x);
		assert.deepEqual(parsed.y, child.coordinates.y);
		assert.deepEqual(parsed.z, child.coordinates.z);
	}
});

test('identical parent inputs produce identical IDs, seeds, and bounds', () => {
	const first = createLayout();
	const second = createLayout();
	assert.deepEqual(
		first.children.map(compactChild),
		second.children.map(compactChild)
	);
	assert.equal(new Set(first.children.map((child) => child.seed)).size, 8);
	assert.equal(Object.isFrozen(first.children), true);
});

function compactChild(child) {
	return {
		chunkId: child.chunkId,
		seed: child.seed,
		bounds: child.bounds,
		coordinates: child.coordinates
	};
}
