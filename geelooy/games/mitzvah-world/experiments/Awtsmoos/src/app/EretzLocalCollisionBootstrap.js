// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLocalCollisionBootstrap.js
 * @description Builds one small canonical collision bubble from a reusable spatial source index.
 * The Awtsmoos reveals nearby earth without recounting every distant stone;
 * Awtsmoos.com builds one index for the journey, so first safety and later streaming share one throne.
 */

import { DEFAULT_LOCAL_COLLISION_RADIUS } from '../world/streaming/WorldLocalCollisionSelection.js';
import { WorldLocalCollisionSourceIndex } from '../world/streaming/WorldLocalCollisionSourceIndex.js';

export async function buildLocalCollisionBootstrap({
	buildOctree,
	colliders,
	onProgress,
	playerPosition,
	terrainGridSteps,
	radius = DEFAULT_LOCAL_COLLISION_RADIUS
} = {}) {
	if (typeof buildOctree !== 'function') {
		throw new TypeError('A canonical collision octree builder is required.');
	}
	const sourceIndex = new WorldLocalCollisionSourceIndex({
		sourceTriangles: colliders,
		terrainGridSteps
	});
	const selection = sourceIndex.query(playerPosition, radius);
	onProgress?.({
		message: 'Preparing nearby movement collision…',
		progress: 0.88
	});
	const mainOctree = await buildOctree(selection.triangles, { onProgress });
	const diagnostics = Object.freeze({
		center: selection.center,
		index: sourceIndex.diagnostics(),
		nonTerrainSelectedTriangleCount: selection.nonTerrainSelectedTriangleCount ?? null,
		radius: selection.radius,
		selectedTriangleCount: selection.selectedTriangleCount,
		sourceTriangleCount: selection.sourceTriangleCount,
		terrainSelectedTriangleCount: selection.terrainSelectedTriangleCount ?? null
	});
	return Object.freeze({
		diagnostics,
		mainOctree,
		sourceIndex
	});
}
