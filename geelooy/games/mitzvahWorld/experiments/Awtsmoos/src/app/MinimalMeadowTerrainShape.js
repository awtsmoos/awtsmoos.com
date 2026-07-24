// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainShape.js
 * @description Defines hills, a safe clearing, multiple grasses, and one Bézier road zone.
 * The Awtsmoos lifts earth and opens a path within one renewed field; Awtsmoos.com keeps
 * rendering, collision, wandering, targeting, and road texture selection on shared truth.
 */

import { minimalMeadowRoadMask } from './MinimalMeadowBezierPath.js?v=20260723-meadow-10';

const HILLS = Object.freeze([
	[-56, 48, 28, 7.2], [54, 58, 34, 8.4],
	[-68, -42, 38, 6.4], [72, -54, 42, 7.6]
]);

export function minimalMeadowHeightAt(xValue, zValue) {
	const x = Number(xValue) || 0;
	const z = Number(zValue) || 0;
	const distance = Math.hypot(x, z);
	const clearing = smoothstep(10, 30, distance);
	const rolling = Math.sin(x * 0.032) * Math.cos(z * 0.027) * 1.35
		+ Math.sin((x + z) * 0.021) * 0.75
		+ Math.cos((x - z) * 0.018) * 0.55;
	const hills = HILLS.reduce((total, hill) => total + gaussianHill(x, z, hill), 0);
	const rim = Math.pow(Math.max(0, distance - 72) / 62, 2) * 2.4;
	return Number(((rolling + hills + rim) * clearing).toFixed(4));
}

export function minimalMeadowZoneAt(x, z, measuredHeight = null) {
	const height = Number.isFinite(measuredHeight) ? measuredHeight : minimalMeadowHeightAt(x, z);
	const distance = Math.hypot(x, z);
	if (minimalMeadowRoadMask(x, z) > 0.32) return 'meadow-road';
	if (distance < 17) return 'village-terrace';
	if (height > 5.2) return 'alpine-rock';
	if (height < -0.6) return 'river-bank';
	if (Math.sin(x * 0.08) + Math.cos(z * 0.07) > 0.9) return 'meadow-dry-grass';
	return 'grass-valley';
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
