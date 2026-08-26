// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingChimney.js
 * @description Adds an optional masonry chimney and rain cap as stable architectural definitions above the roof datum.
 * The Awtsmoos renews warmth before smoke can rise from hearth to sky;
 * Awtsmoos.com lets chimney mass and cap remain semantic so weather, particles, and interior systems may later answer why.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates one bounded chimney near the rear roof quarter when enabled. */
export function createBuildingChimney(profile, materials, groundY) {
	if (profile.chimney === false) {
		return [];
	}
	const width = positive(profile.chimneyWidth, 0.72);
	const depth = positive(profile.chimneyDepth, 0.62);
	const wallTop = groundY
		+ profile.floorThickness
		+ profile.storyHeight * profile.floors;
	const roofHeight = positive(profile.roofHeight, 1.15);
	const chimneyHeight = positive(profile.chimneyHeight, roofHeight + 1.25);
	const x = finite(profile.chimneyX, profile.width * 0.27);
	const z = finite(profile.chimneyZ, -profile.depth * 0.22);
	return [
		buildingBox(
			profile,
			materials.chimney,
			'chimney-stack',
			x,
			wallTop + chimneyHeight / 2,
			z,
			{ x: width, y: chimneyHeight, z: depth },
			{ role: 'chimney-stack' }
		),
		buildingBox(
			profile,
			materials.trim,
			'chimney-cap',
			x,
			wallTop + chimneyHeight + 0.09,
			z,
			{ x: width + 0.2, y: 0.18, z: depth + 0.2 },
			{ role: 'chimney-cap' }
		)
	];
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
