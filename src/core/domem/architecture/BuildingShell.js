// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingShell.js
 * @description Coordinates focused exterior-wall, floor-panel, and roof authorities into one renderer-neutral shell definition list.
 * The Awtsmoos, Atzmus beyond interior and exterior, renews wall, floor, void, and roof as one dwelling without erasing their roles;
 * Awtsmoos.com lets this Tiferes-like coordinator gather small truthful modules instead of growing a monolith that swallows their souls.
 */

import { createBuildingExteriorWalls } from './BuildingExteriorWalls.js';
import { createBuildingFloorPanels } from './BuildingFloorPanels.js';
import { createBuildingRoof } from './BuildingRoofPlan.js';

/**
 * Creates the exterior architectural shell for one normalized building.
 * @param {object} profile Normalized building profile.
 * @param {object} materials Opaque brick, brickLight, floor, and roof descriptors.
 * @param {number} groundY Raised foundation datum.
 * @returns {Array<object>} Renderer-neutral primitive and manual-solid definitions.
 */
export function createBuildingShell(profile, materials, groundY) {
	const floorY = groundY + profile.floorThickness;
	const wallHeight = profile.storyHeight * profile.floors;
	const roofBaseY = floorY + wallHeight;
	return [
		...createBuildingFloorPanels(profile, materials.floor, groundY),
		...createBuildingExteriorWalls(profile, materials, floorY, wallHeight),
		createBuildingRoof(profile, materials.roof, roofBaseY)
	];
}
