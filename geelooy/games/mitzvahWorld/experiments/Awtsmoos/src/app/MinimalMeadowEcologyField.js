// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEcologyField.js
 * @description Derives grass, flower, tree, soil, moisture, and exposure fields from one terrain blend.
 * The Awtsmoos lets every root and petal answer the same interwoven earth;
 * Awtsmoos.com keeps roads clear, wet ground fertile, slopes sparse, and all variation deterministic.
 */

import {
	sampleMinimalMeadowTerrainBlend
} from './MinimalMeadowTerrainBlendModel.js';

export function sampleMinimalMeadowEcology(terrain, x, z, options = {}) {
	const height = finite(options.height, terrain?.heightAt?.(x, z));
	const slope = clamp(options.slope ?? estimateSlope(terrain, x, z));
	const blend = sampleMinimalMeadowTerrainBlend({
		height,
		moisture: options.moisture,
		slope,
		x,
		z
	});
	const road = clamp(blend.weights.roadCenter + blend.weights.roadShoulder * 0.72);
	const meadow = 1 - road;
	const moisture = blend.factors.moisture;
	const fertility = clamp(
		blend.weights.lush * 1.2
		+ blend.weights.moss * 0.92
		+ blend.weights.soil * 0.36
		- slope * 0.34
	);
	const exposure = clamp(
		blend.weights.dry * 0.9
		+ slope * 0.72
		+ blend.factors.height * 0.28
	);
	return Object.freeze({
		blend,
		exposure,
		fertility,
		flowerDensity: clamp(meadow * fertility * (0.42 + moisture * 0.78)),
		grassDensity: clamp(meadow * (0.52 + fertility * 0.64 - slope * 0.22)),
		height,
		moisture,
		road,
		slope,
		treeAffinity: clamp(meadow * (0.3 + fertility * 0.86 - slope * 0.44)),
		zone: ecologyZone({ exposure, fertility, moisture, road, slope })
	});
}

function estimateSlope(terrain, x, z) {
	if (!terrain?.heightAt) return 0;
	const span = 1.5;
	const left = finite(terrain.heightAt(x - span, z));
	const right = finite(terrain.heightAt(x + span, z));
	const back = finite(terrain.heightAt(x, z - span));
	const front = finite(terrain.heightAt(x, z + span));
	return clamp(Math.hypot(right - left, front - back) / (span * 5));
}

function ecologyZone(value) {
	if (value.road > 0.3) return 'path-edge';
	if (value.moisture > 0.67 && value.slope < 0.42) return 'wet-meadow';
	if (value.exposure > 0.62) return 'dry-upland';
	if (value.fertility > 0.58) return 'flower-meadow';
	return 'mixed-meadow';
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function clamp(value) {
	return Math.max(0, Math.min(1, finite(value)));
}
