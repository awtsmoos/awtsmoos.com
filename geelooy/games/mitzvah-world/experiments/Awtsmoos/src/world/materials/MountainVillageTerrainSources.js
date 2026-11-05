// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageTerrainSources.js
 * @description Names every terrain and structural source independently of family deduplication.
 * The Awtsmoos remains one when aliases reveal one URL; Awtsmoos.com prevents a shortened array
 * from turning granite into nothing or moving bluestone, cobble, soil, and strata into false roles.
 */

import { highestResolutionSurface } from '../../assets/HighestResolutionSurfaceCatalog.js';
import { runtimeMaterialByRole } from '../../assets/RuntimeMaterialManifest.js';
import { SURFACE_TEXTURE_FAMILIES as F } from '../../assets/SurfaceTextureFamilies.js';

export const MOUNTAIN_VILLAGE_SOURCES = Object.freeze({
	bark: roleUrl('forest.bark'),
	bluestone: F.stone.bluestone1,
	cobblestone: F.stone.cobblestone,
	darkForestFloor: F.terrain.darkForestFloor,
	dirt: highestResolutionSurface('dirt'),
	dryGrass: highestResolutionSurface('dryGrass'),
	fieldstone: roleUrl('stone.fieldstone'),
	forestFloor: highestResolutionSurface('forestFloor'),
	gold: roleUrl('metal.gold'),
	granite: F.stone.granite1,
	grass: highestResolutionSurface('baseGrass'),
	iron: roleUrl('metal.iron'),
	marsh: highestResolutionSurface('marsh'),
	mud: highestResolutionSurface('mud'),
	parchment: roleUrl('sign.parchment'),
	roofTile: roleUrl('roof.tile'),
	sand: highestResolutionSurface('sand'),
	soilDirtFive: F.terrain.dirt5,
	stone: highestResolutionSurface('stone'),
	stoneFloor: F.stone.floor2,
	stoneOne: F.stone.stone1,
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
