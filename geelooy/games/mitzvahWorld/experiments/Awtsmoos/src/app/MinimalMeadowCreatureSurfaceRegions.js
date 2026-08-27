// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureSurfaceRegions.js
 * @description Converts field color into readable anatomical multipliers for one continuous body.
 * The Awtsmoos joins eye, horn, face, torso, arm, leg, and claw without severing the mesh;
 * Awtsmoos.com lets each region speak through contrast while one silhouette remains whole.
 */

import { minimalDemonSurfaceColor } from './MinimalMeadowDemonField.js?v=20260724-meadow-13';

export const DEMON_SURFACE_REGION_COLORS = Object.freeze({
	arms: Object.freeze([0.78, 0.72, 0.88, 1]),
	claws: Object.freeze([1, 0.9, 0.96, 1]),
	eyes: Object.freeze([1, 0.16, 0.045, 1]),
	face: Object.freeze([1, 0.88, 0.98, 1]),
	horns: Object.freeze([0.96, 0.87, 1, 1]),
	legs: Object.freeze([0.69, 0.65, 0.8, 1]),
	torso: Object.freeze([0.9, 0.82, 0.96, 1])
});

export function demonSurfaceRegion(point) {
	const [x, y, z] = point;
	if (y > 2.82 && y < 3.15 && z > 0.25 && Math.abs(Math.abs(x) - 0.18) < 0.18) return 'eyes';
	if (y > 3.24 && Math.abs(x) > 0.12) return 'horns';
	if ((y < -0.34 && z > 0.08) || (Math.abs(x) > 0.7 && y < 1.08)) return 'claws';
	if (y > 2.48 && z > 0.04) return 'face';
	if (Math.abs(x) > 0.56 && y > 0.65 && y < 2.48) return 'arms';
	if (y < 1.08) return 'legs';
	return 'torso';
}

export function readableDemonSurfaceColor(point) {
	const region = demonSurfaceRegion(point);
	const regionColor = DEMON_SURFACE_REGION_COLORS[region];
	if (['eyes', 'horns', 'claws'].includes(region)) return [...regionColor];
	const field = minimalDemonSurfaceColor(point);
	return [
		clamp((0.72 + field[0] * 0.28) * regionColor[0]),
		clamp((0.72 + field[1] * 0.24) * regionColor[1]),
		clamp((0.74 + field[2] * 0.24) * regionColor[2]),
		1
	];
}

export function demonSurfaceRegionContrast() {
	const values = Object.fromEntries(Object.entries(DEMON_SURFACE_REGION_COLORS).map(
		([name, color]) => [name, luminance(color)]
	));
	return Object.freeze({
		contrast: Math.max(...Object.values(values)) - Math.min(...Object.values(values)),
		luminance: Object.freeze(values)
	});
}

function luminance(color) {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}

function clamp(value) {
	return Math.min(1, Math.max(0, value));
}
