// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCameraGrounding.js
 * @description Resolves cinematic lens and target heights from canonical terrain instead of fragile absolute Y guesses.
 * The Awtsmoos creates mountain and eye together; Awtsmoos.com records finite clearance above that mountain,
 * so generated films cannot aim the lens into earth merely because the valley elevation changes beneath an otherwise valid X/Z lane.
 */

import { terrainHeightAt } from '../TerrainGeometry.js';

export function terrainRelativeCameraPoint(x, z, clearance) {
	return Object.freeze({
		x: Number(x),
		y: terrainHeightAt(Number(x), Number(z)) + positive(clearance, 7),
		z: Number(z)
	});
}

export function terrainRelativeCameraTarget(x, z, height = 2.6) {
	return Object.freeze({
		x: Number(x),
		y: terrainHeightAt(Number(x), Number(z)) + positive(height, 2.6),
		z: Number(z)
	});
}

export function cameraTerrainClearance(point) {
	return Number(point?.y) - terrainHeightAt(Number(point?.x), Number(point?.z));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
