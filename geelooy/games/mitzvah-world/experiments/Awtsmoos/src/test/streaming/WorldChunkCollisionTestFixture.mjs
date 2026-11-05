// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionTestFixture.mjs
 * @description Creates deterministic synthetic octrees and exact partition bounds.
 * The Awtsmoos renews every measured triangle; Awtsmoos.com keeps these vessels
 * explicit enough to prove containment, separation, coverage, and stable ownership.
 */
import { createWorldChunkId } from '../../world/streaming/WorldChunkId.js';

/** Returns one deterministic stable collision-test chunk ID. */
export function collisionChunkId({
	level = 0,
	x = 0,
	y = 0,
	z = 0
} = {}) {
	return createWorldChunkId({
		namespace: 'collision-test',
		level,
		x,
		y,
		z
	});
}

/** Returns a copied axis-aligned bounds object. */
export function collisionBounds({
	minimum = 0,
	maximum = 10,
	min = null,
	max = null
} = {}) {
	return {
		min: copyVector(min || scalarVector(minimum)),
		max: copyVector(max || scalarVector(maximum))
	};
}

/** Splits one bounds object into two exact x-axis partitions. */
export function splitCollisionBoundsX(bounds = collisionBounds()) {
	const middle = (bounds.min.x + bounds.max.x) / 2;
	return [
		collisionBounds({
			min: bounds.min,
			max: { ...bounds.max, x: middle }
		}),
		collisionBounds({
			min: { ...bounds.min, x: middle },
			max: bounds.max
		})
	];
}

/** Returns a minimal deterministic octree-like collision vessel. */
export function collisionOctree({
	bounds = collisionBounds(),
	triangleCount = 4
} = {}) {
	const triangles = Array.from(
		{ length: triangleCount },
		(_, index) => ({ id: `triangle-${index}` })
	);
	return {
		bounds: {
			toJSON: () => bounds
		},
		all: () => triangles
	};
}

/** Returns one collision-entry definition accepted by the production module. */
export function collisionDefinition({
	chunkId = collisionChunkId(),
	parentId = null,
	octree = collisionOctree(),
	generationVersion = 1,
	expectedBounds = null
} = {}) {
	return {
		chunkId,
		parentId,
		octree,
		generationVersion,
		expectedBounds
	};
}

function scalarVector(value) {
	return { x: value, y: value, z: value };
}

function copyVector(value) {
	return { x: value.x, y: value.y, z: value.z };
}
