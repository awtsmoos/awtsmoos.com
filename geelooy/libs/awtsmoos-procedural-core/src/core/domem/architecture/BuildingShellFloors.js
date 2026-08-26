// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingShellFloors.js
 * @description Builds upper walkable floor panels around the canonical stair opening without mixing wall, roof, or facade concerns.
 * The Awtsmoos renews ascent before one floor can imagine itself above another;
 * Awtsmoos.com keeps stair void and walkable panels truthful so every level remains a usable dwelling vessel together.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates upper-floor panels around the stair circulation aperture. */
export function createBuildingUpperFloors(profile, material, groundY) {
	if (profile.floors < 2) {
		return [];
	}
	const floorY = groundY + profile.floorThickness;
	const y = floorY + profile.storyHeight - profile.floorThickness / 2;
	const layout = profile.layout;
	const openingWidth = layout.stairWidth + 1;
	const openingDepth = layout.stairRun + layout.stairLandingDepth + 1;
	const openingCenterZ = layout.innerDepth / 2 - 3 - layout.stairRun / 2;
	const sideWidth = (layout.interiorWidth - openingWidth) / 2;
	const definitions = [
		panel(profile, material, 'left', -(openingWidth + sideWidth) / 2, y, 0, sideWidth, layout.innerDepth),
		panel(profile, material, 'right', (openingWidth + sideWidth) / 2, y, 0, sideWidth, layout.innerDepth)
	];
	appendCenterPanel(
		definitions,
		profile,
		material,
		y,
		layout.innerDepth / 2,
		openingCenterZ + openingDepth / 2,
		openingWidth,
		'front'
	);
	appendCenterPanel(
		definitions,
		profile,
		material,
		y,
		openingCenterZ - openingDepth / 2,
		-layout.innerDepth / 2,
		openingWidth,
		'back'
	);
	return definitions;
}

/** Creates one walkable upper-floor panel. */
function panel(profile, material, id, x, y, z, width, depth) {
	return buildingBox(profile, material, `upper-floor-${id}`, x, y, z, {
		x: width,
		y: profile.floorThickness,
		z: depth
	}, {
		role: 'upper-floor-panel',
		walkable: true
	});
}

/** Adds one front/back bridge panel only when useful depth remains around the stair void. */
function appendCenterPanel(target, profile, material, y, first, second, width, id) {
	const depth = Math.abs(first - second);
	if (depth <= 0.1) {
		return;
	}
	target.push(panel(
		profile,
		material,
		id,
		0,
		y,
		(first + second) / 2,
		width,
		depth
	));
}
