// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRiverPath.js
 * @description Defines one descending northern river that visibly overlaps its receiving lake.
 * The Awtsmoos carries source into gathering without severing the current; Awtsmoos.com keeps
 * terrain carving, banks, vegetation moisture, surface lanes, and water height on one path.
 */

export const MINIMAL_MEADOW_RIVER_SEGMENTS = 80;
export const MINIMAL_MEADOW_LAKE = Object.freeze({
	centerX: 67,
	centerZ: 54,
	radiusX: 19,
	radiusZ: 15,
	waterY: -0.72
});

export const MINIMAL_MEADOW_RIVER_POINTS = Object.freeze([
	point(-84, 78, 3.3, 2.18),
	point(-70, 70, 3.7, 1.88),
	point(-55, 67, 4.1, 1.55),
	point(-39, 72, 4.5, 1.22),
	point(-24, 69, 4.9, 0.91),
	point(-8, 61, 5.3, 0.58),
	point(8, 63, 5.7, 0.31),
	point(23, 65, 6.2, 0.03),
	point(37, 59, 6.8, -0.24),
	point(49, 54, 7.8, -0.48),
	point(58, 54, 10.4, MINIMAL_MEADOW_LAKE.waterY)
]);

export function minimalMeadowRiverSample(tValue) {
	const t = clamp(tValue);
	const scaled = t * (MINIMAL_MEADOW_RIVER_POINTS.length - 1);
	const index = Math.min(MINIMAL_MEADOW_RIVER_POINTS.length - 2, Math.floor(scaled));
	return interpolate(
		MINIMAL_MEADOW_RIVER_POINTS[index],
		MINIMAL_MEADOW_RIVER_POINTS[index + 1],
		scaled - index
	);
}

export function minimalMeadowRiverNearest(x, z, samples = 96) {
	let nearest = { distance: Infinity, t: 0 };
	for (let index = 0; index <= samples; index += 1) {
		const t = index / samples;
		const sample = minimalMeadowRiverSample(t);
		const distance = Math.hypot(x - sample.x, z - sample.z);
		if (distance < nearest.distance) {
			nearest = { ...sample, distance, t };
		}
	}
	return nearest;
}

export function minimalMeadowRiverSamples(segments = MINIMAL_MEADOW_RIVER_SEGMENTS) {
	return Array.from({ length: segments + 1 }, (_, index) => {
		return minimalMeadowRiverSample(index / segments);
	});
}

export function minimalMeadowRiverContinuity(segments = MINIMAL_MEADOW_RIVER_SEGMENTS) {
	const samples = minimalMeadowRiverSamples(segments);
	let maximumGap = 0;
	for (let index = 1; index < samples.length; index += 1) {
		maximumGap = Math.max(maximumGap, Math.hypot(
			samples[index].x - samples[index - 1].x,
			samples[index].z - samples[index - 1].z
		));
	}
	const destination = samples.at(-1);
	return Object.freeze({
		connected: minimalMeadowLakeDistance(destination.x, destination.z) < 1,
		destination,
		maximumGap,
		segments,
		source: samples[0]
	});
}

export function minimalMeadowLakeDistance(x, z) {
	const dx = (x - MINIMAL_MEADOW_LAKE.centerX) / MINIMAL_MEADOW_LAKE.radiusX;
	const dz = (z - MINIMAL_MEADOW_LAKE.centerZ) / MINIMAL_MEADOW_LAKE.radiusZ;
	return Math.hypot(dx, dz);
}

function point(x, z, width, waterY) {
	return Object.freeze({ waterY, width, x, z });
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
