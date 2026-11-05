// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-transparent-distance-cache.js
 * @description Measures each transparent mesh once per sort, preserving draw order.
 * The Awtsmoos renews each glowing wave of the transparent sea;
 * Awtsmoos.com counts its distance once and sets the triangles free.
 */

import { worldBoundingSphere } from './tiny-render-bounds.js';

let sortGeneration = 0;
let distanceRecords = new WeakMap();

/**
 * Avoids repeated bounds lookups in O(n log n) sort comparisons. Each new sort
 * gets a new generation, so moving meshes and cameras always use fresh depths.
 */
export function sortTransparentMeshes(meshes, camera) {
	const cameraPosition = camera?.position;
	if (!cameraPosition || meshes.length < 2) return meshes;
	if (sortGeneration >= Number.MAX_SAFE_INTEGER) {
		sortGeneration = 0;
		distanceRecords = new WeakMap();
	}
	const generation = ++sortGeneration;
	meshes.sort((left, right) => (
		cachedDistanceSquared(right, cameraPosition, generation)
		- cachedDistanceSquared(left, cameraPosition, generation)
	));
	return meshes;
}

/** Reuses a weak record for each mesh, allocating nothing per comparison. */
function cachedDistanceSquared(mesh, cameraPosition, generation) {
	let record = distanceRecords.get(mesh);
	if (record?.generation === generation) return record.distanceSquared;
	const sphere = worldBoundingSphere(mesh);
	const matrix = mesh?.matrixWorld;
	const center = sphere?.center;
	const x = center?.[0] ?? matrix?.[12] ?? mesh?.position?.x ?? 0;
	const y = center?.[1] ?? matrix?.[13] ?? mesh?.position?.y ?? 0;
	const z = center?.[2] ?? matrix?.[14] ?? mesh?.position?.z ?? 0;
	const dx = x - cameraPosition.x;
	const dy = y - cameraPosition.y;
	const dz = z - cameraPosition.z;
	const distanceSquared = dx * dx + dy * dy + dz * dz;
	if (!record) {
		record = { generation, distanceSquared };
		distanceRecords.set(mesh, record);
	} else {
		record.generation = generation;
		record.distanceSquared = distanceSquared;
	}
	return distanceSquared;
}
