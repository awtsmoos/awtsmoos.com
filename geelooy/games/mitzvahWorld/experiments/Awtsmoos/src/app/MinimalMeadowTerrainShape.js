// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainShape.js
 * @description Defines hills, village clearing, descending valley, river bed, lake basin, and road.
 * The Awtsmoos lifts earth and lowers a channel within one renewed field; Awtsmoos.com keeps
 * rendering, collision, water, trees, flowers, houses, and road texture selection on shared truth.
 */

import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js?v=20260723-meadow-10';
import {
	MINIMAL_MEADOW_LAKE,
	minimalMeadowLakeDistance,
	minimalMeadowRiverNearest
} from './MinimalMeadowRiverPath.js?v=20260724-meadow-21';

const HILLS = Object.freeze([
	[-56, 48, 28, 7.2], [54, 58, 34, 8.4],
	[-68, -42, 38, 6.4], [72, -54, 42, 7.6]
]);

export function minimalMeadowHeightAt(xValue, zValue) {
	const x = Number(xValue) || 0;
	const z = Number(zValue) || 0;
	const base = baseHeight(x, z);
	const river = minimalMeadowRiverNearest(x, z);
	const riverWeight = 1 - smoothstep(river.width, river.width + 12, river.distance);
	const valleyWeight = 1 - smoothstep(river.width + 3, river.width + 27, river.distance);
	const riverBed = river.waterY - 1.35 - Math.max(0, 1 - river.distance / Math.max(0.1, river.width)) * 0.42;
	const valleyFloor = river.waterY + 1.15 + Math.min(3.2, river.distance * 0.13);
	let height = mix(base, Math.min(base, valleyFloor), valleyWeight * 0.78);
	height = mix(height, riverBed, riverWeight);
	const lakeDistance = minimalMeadowLakeDistance(x, z);
	const lakeBasinWeight = 1 - smoothstep(0.82, 1.42, lakeDistance);
	const lakeBed = MINIMAL_MEADOW_LAKE.waterY - 2.25 + lakeDistance * 0.55;
	height = mix(height, Math.min(height, lakeBed), lakeBasinWeight);
	return Number(height.toFixed(4));
}

export function minimalMeadowZoneAt(x, z, measuredHeight = null) {
	const height = Number.isFinite(measuredHeight) ? measuredHeight : minimalMeadowHeightAt(x, z);
	const river = minimalMeadowRiverNearest(x, z, 48);
	const lakeDistance = minimalMeadowLakeDistance(x, z);
	if (lakeDistance < 1.18) return 'lake-basin';
	if (river.distance < river.width + 5) return 'river-bank';
	if (minimalMeadowRoadMask(x, z) > 0.32) return 'meadow-road';
	if (Math.hypot(x, z) < 17) return 'village-terrace';
	if (height > 5.2) return 'alpine-rock';
	if (height < -0.6) return 'wet-meadow';
	if (Math.sin(x * 0.08) + Math.cos(z * 0.07) > 0.9) return 'meadow-dry-grass';
	return 'grass-valley';
}

function baseHeight(x, z) {
	const distance = Math.hypot(x, z);
	const clearing = smoothstep(10, 30, distance);
	const rolling = Math.sin(x * 0.032) * Math.cos(z * 0.027) * 1.35
		+ Math.sin((x + z) * 0.021) * 0.75
		+ Math.cos((x - z) * 0.018) * 0.55;
	const hills = HILLS.reduce((total, hill) => total + gaussianHill(x, z, hill), 0);
	const rim = Math.pow(Math.max(0, distance - 72) / 62, 2) * 2.4;
	return (rolling + hills + rim) * clearing;
}

function gaussianHill(x, z, [centerX, centerZ, radius, height]) {
	const dx = x - centerX;
	const dz = z - centerZ;
	return Math.exp(-(dx * dx + dz * dz) / (2 * radius * radius)) * height;
}

function smoothstep(minimum, maximum, value) {
	const ratio = Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)));
	return ratio * ratio * (3 - 2 * ratio);
}

function mix(first, second, ratio) {
	return first + (second - first) * Math.max(0, Math.min(1, ratio));
}
