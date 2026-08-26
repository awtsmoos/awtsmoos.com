// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingFloorPanels.js
 * @description Owns walkable ground and upper-story floor panels while preserving the canonical staircase aperture as true empty space.
 * The Awtsmoos renews support and opening in one instant; Awtsmoos.com lets each floor become a measured keli for footsteps
 * while the stair void remains honestly absent geometry, ready for ascent instead of hidden overlap beneath the world's lips.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates ground and optional upper floor panels for one normalized building. */
export function createBuildingFloorPanels(profile, material, groundY) {
	const floorY = groundY + profile.floorThickness;
	return [
		groundFloor(profile, material, groundY),
		...upperFloor(profile, material, floorY)
	];
}

function groundFloor(profile, material, groundY) {
	return buildingBox(profile, material, 'ground-floor', 0, groundY + profile.floorThickness / 2, 0, {
		x: profile.width - profile.wallThickness * 2,
		y: profile.floorThickness,
		z: profile.depth - profile.wallThickness * 2
	}, { role: 'level-interior-floor', walkable: true });
}

function upperFloor(profile, material, floorY) {
	if (profile.floors < 2) return [];
	const y = floorY + profile.storyHeight - profile.floorThickness / 2;
	const layout = profile.layout;
	const openingWidth = layout.stairWidth + 1;
	const openingDepth = layout.stairRun + layout.stairLandingDepth + 1;
	const openingCenterZ = layout.innerDepth / 2 - 3 - layout.stairRun / 2;
	const sideWidth = (layout.interiorWidth - openingWidth) / 2;
	const definitions = [
		buildingBox(profile, material, 'upper-floor-left', -(openingWidth + sideWidth) / 2, y, 0, {
			x: sideWidth,
			y: profile.floorThickness,
			z: layout.innerDepth
		}, { role: 'upper-floor-panel', walkable: true }),
		buildingBox(profile, material, 'upper-floor-right', (openingWidth + sideWidth) / 2, y, 0, {
			x: sideWidth,
			y: profile.floorThickness,
			z: layout.innerDepth
		}, { role: 'upper-floor-panel', walkable: true })
	];
	appendPanel(definitions, profile, material, y, layout.innerDepth / 2, openingCenterZ + openingDepth / 2, openingWidth, 'front');
	appendPanel(definitions, profile, material, y, openingCenterZ - openingDepth / 2, -layout.innerDepth / 2, openingWidth, 'back');
	return definitions;
}

function appendPanel(target, profile, material, y, first, second, width, id) {
	const length = Math.abs(first - second);
	if (length <= 0.1) return;
	target.push(buildingBox(profile, material, `upper-floor-${id}`, 0, y, (first + second) / 2, {
		x: width,
		y: profile.floorThickness,
		z: length
	}, { role: 'upper-floor-panel', walkable: true }));
}
