// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRiverPath.js
 * @description Defines one descending northern river and its receiving lake as shared geometry truth.
 * The Awtsmoos carries source into gathering without severing the current; Awtsmoos.com keeps
 * terrain carving, surface lanes, tree exclusion, flowers, foam, and water height on one path.
 */

export const MINIMAL_MEADOW_LAKE = Object.freeze({
	centerX: 67,
	centerZ: 54,
	radiusX: 19,
	radiusZ: 15,
	waterY: -0.72
});

export const MINIMAL_MEADOW_RIVER_POINTS = Object.freeze([
	Object.freeze({ x: -82, z: 76, width: 3.4, waterY: 2.1 }),
	Object.freeze({ x: -58, z: 67, width: 4.1, waterY: 1.55 }),
	Object.freeze({ x: -32, z: 72, width: 4.8, waterY: 1.02 }),
	Object.freeze({ x: -7, z: 61, width: 5.3, waterY: 0.52 }),
	Object.freeze({ x: 19, z: 65, width: 6.1, waterY: 0.08 }),
	Object.freeze({ x: 43, z: 54, width: 7.4, waterY: -0.38 }),
	Object.freeze({ x: 58, z: 54, width: 10.2, waterY: MINIMAL_MEADOW_LAKE.waterY })
]);

export function minimalMeadowRiverSample(tValue) {
	const t = clamp(tValue);
	const scaled = t * (MINIMAL_MEADOW_RIVER_POINTS.length - 1);
	const index = Math.min(MINIMAL_MEADOW_RIVER_POINTS.length - 2, Math.floor(scaled));
	const ratio = scaled - index;
	return interpolate(MINIMAL_MEADOW_RIVER_POINTS[index], MINIMAL_MEADOW_RIVER_POINTS[index + 1], ratio);
}

export function minimalMeadowRiverNearest(x, z, samples = 72) {
	let nearest = { distance: Infinity, t: 0 };
	for (let index = 0; index <= samples; index += 1) {
		const t = index / samples;
		const sample = minimalMeadowRiverSample(t);
		const distance = Math.hypot(x - sample.x, z - sample.z);
		if (distance < nearest.distance) nearest = { ...sample, distance, t };
	}
	return nearest;
}

export function minimalMeadowLakeDistance(x, z) {
	const dx = (x - MINIMAL_MEADOW_LAKE.centerX) / MINIMAL_MEADOW_LAKE.radiusX;
	const dz = (z - MINIMAL_MEADOW_LAKE.centerZ) / MINIMAL_MEADOW_LAKE.radiusZ;
	return Math.hypot(dx, dz);
}

function interpolate(first, second, ratio) {
	return {
		waterY: first.waterY + (second.waterY - first.waterY) * ratio,
		width: first.width + (second.width - first.width) * ratio,
		x: first.x + (second.x - first.x) * ratio,
		z: first.z + (second.z - first.z) * ratio
	};
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
