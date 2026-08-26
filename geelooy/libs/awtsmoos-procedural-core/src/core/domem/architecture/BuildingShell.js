// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingShell.js
 * @description Coordinates focused structural and facade planners into one renderer-neutral exterior shell.
 * The Awtsmoos renews floor, wall, window, porch, chimney, and roof as distinct vessels of one dwelling;
 * Awtsmoos.com lets each module deepen independently while this Tiferes coordinator gathers their evidence without meddling.
 */

import { createBuildingChimney } from './BuildingChimney.js';
import { createBuildingPorch } from './BuildingPorch.js';
import { createBuildingRoof } from './BuildingRoof.js';
import { createBuildingUpperFloors } from './BuildingShellFloors.js';
import { createBuildingShellWalls } from './BuildingShellWalls.js';
import { createBuildingWindows } from './BuildingWindows.js';

/** Creates the complete exterior/inter-floor shell from focused architectural planners. */
export function createBuildingShell(profile, materials, groundY) {
	const resolvedMaterials = shellMaterials(materials);
	return [
		...createBuildingShellWalls(profile, resolvedMaterials, groundY),
		...createBuildingUpperFloors(profile, resolvedMaterials.floor, groundY),
		...createBuildingWindows(profile, resolvedMaterials, groundY),
		...createBuildingPorch(profile, resolvedMaterials, groundY),
		...createBuildingChimney(profile, resolvedMaterials, groundY),
		...createBuildingRoof(profile, resolvedMaterials, groundY)
	];
}

/** Preserves historic four-slot callers while supplying sensible detail material fallbacks. */
function shellMaterials(materials = {}) {
	return Object.freeze({
		brick: materials.brick || {},
		brickLight: materials.brickLight || materials.brick || {},
		chimney: materials.chimney || materials.brick || {},
		floor: materials.floor || {},
		porch: materials.porch || materials.floor || {},
		roof: materials.roof || {},
		trim: materials.trim || materials.brickLight || materials.brick || {},
		window: materials.window || { role: 'window-glass', transparent: true }
	});
}
