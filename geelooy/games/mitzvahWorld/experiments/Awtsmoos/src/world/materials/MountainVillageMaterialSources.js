// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageMaterialSources.js
 * @description Exposes canonical source URLs and deduplicated multi-variant village families.
 * The Awtsmoos renews meadow, earth, stone, timber, roof, and water through many truthful
 * garments; Awtsmoos.com groups deployed full-resolution variants instead of repeating aliases.
 */

import { highestResolutionSurface } from '../../assets/HighestResolutionSurfaceCatalog.js';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
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

export const MOUNTAIN_VILLAGE_FAMILIES = Object.freeze({
	bricks: family('bricks', Object.values(F.bricks)),
	earth: family('earth', [
		MOUNTAIN_VILLAGE_SOURCES.dirt,
		F.terrain.dirt1,
		F.terrain.dirt2,
		F.terrain.dirt5,
		F.terrain.dirt6,
		F.terrain.tilledSoil,
		F.terrain.mud,
		F.terrain.sand1
	]),
	forest: family('forest', [
		F.terrain.darkForestFloor,
		F.terrain.forestLeaves,
		F.terrain.marshGrass,
		MOUNTAIN_VILLAGE_SOURCES.bark
	]),
	grass: family('grass', [
		MOUNTAIN_VILLAGE_SOURCES.grass,
		F.terrain.grass1,
		F.terrain.grass4,
		F.terrain.grass5,
		F.terrain.grass6,
		F.terrain.grass7,
		F.terrain.grass8,
		MOUNTAIN_VILLAGE_SOURCES.wildGrass,
		F.terrain.marshGrass
	]),
	grassTransitions: family('grass-transition', [
		F.terrain.dirtGrass1,
		F.terrain.dirtGrass2,
		F.terrain.dirtGrass3
	]),
	roof: family('roof', Object.values(F.roof)),
	stone: family('stone', [
		MOUNTAIN_VILLAGE_SOURCES.fieldstone,
		...Object.values(F.stone)
	]),
	water: family('water', Object.values(F.water)),
	wood: family('wood', [MOUNTAIN_VILLAGE_SOURCES.wood, ...Object.values(F.wood)])
});

function roleUrl(role) {
	const record = runtimeMaterialByRole(role);
	if (!record?.primaryUrl) throw new Error(`Missing canonical material role: ${role}`);
	return record.primaryUrl;
}

function family(role, urls) {
	return Object.freeze([...new Set(urls)].map(url => {
		return assertProductionMaterialUrl(url, `${role} family`);
	}));
}
