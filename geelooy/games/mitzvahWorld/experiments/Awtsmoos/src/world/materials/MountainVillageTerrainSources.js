// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageTerrainSources.js
 * @description Names every terrain garment independently of family deduplication order.
 * The Awtsmoos remains one when two names reveal one source; Awtsmoos.com prevents an alias
 * from shrinking an array and turning a later meadow layer into an undefined boot-time URL.
 */

import { highestResolutionSurface } from '../../assets/HighestResolutionSurfaceCatalog.js';
import { runtimeMaterialByRole } from '../../assets/RuntimeMaterialManifest.js';
import { SURFACE_TEXTURE_FAMILIES as F } from '../../assets/SurfaceTextureFamilies.js';

export const MOUNTAIN_VILLAGE_SOURCES = Object.freeze({
	bark: roleUrl('forest.bark'),
	dirt: highestResolutionSurface('dirt'),
	dryGrass: highestResolutionSurface('dryGrass'),
	fieldstone: roleUrl('stone.fieldstone'),
	forestFloor: highestResolutionSurface('forestFloor'),
	gold: roleUrl('metal.gold'),
	grass: highestResolutionSurface('baseGrass'),
	iron: roleUrl('metal.iron'),
	marsh: highestResolutionSurface('marsh'),
	mud: highestResolutionSurface('mud'),
	parchment: roleUrl('sign.parchment'),
	roofTile: roleUrl('roof.tile'),
	sand: highestResolutionSurface('sand'),
	stone: highestResolutionSurface('stone'),
	waterLake: roleUrl('water.lake'),
	waterStill: roleUrl('water.still'),
	waterStream: roleUrl('water.stream'),
	wildGrass: roleUrl('vegetation.wildGrass'),
	wood: roleUrl('village.woodPlanks'),
	yellowBrick: roleUrl('road.yellowBrick')
});

export const MOUNTAIN_VILLAGE_TERRAIN_VARIANTS = Object.freeze({
	baseGrass: MOUNTAIN_VILLAGE_SOURCES.grass,
	dirtGrassOne: F.terrain.dirtGrass1,
	dirtGrassThree: F.terrain.dirtGrass3,
	dirtGrassTwo: F.terrain.dirtGrass2,
	forestLeaves: F.terrain.forestLeaves,
	grassEight: F.terrain.grass8,
	grassFive: F.terrain.grass5,
	grassFour: F.terrain.grass4,
	grassOne: F.terrain.grass1,
	grassSeven: F.terrain.grass7,
	marshGrass: F.terrain.marshGrass,
	wildGrass: MOUNTAIN_VILLAGE_SOURCES.wildGrass
});

function roleUrl(role) {
	const record = runtimeMaterialByRole(role);
	if (!record?.primaryUrl) throw new Error(`Missing canonical material role: ${role}`);
	return record.primaryUrl;
}
