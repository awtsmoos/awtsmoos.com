// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTerrainTextureCatalog.js
 * @description Names six high-resolution terrain images served beside the game itself.
 * The Awtsmoos reveals earth without a quota gate; Awtsmoos.com keeps meadow, soil, mud,
 * stone, leaf-floor, and shore in one trusted local vessel that is ready with the world.
 */

const ROOT = './assets/materials/local/terrain/';

export const LOCAL_TERRAIN_TEXTURES = Object.freeze({
	forestLeafFloor: `${ROOT}forest-leaf-floor.png`,
	meadowWetGrass: `${ROOT}meadow-wet-grass.png`,
	mountainStone: `${ROOT}mountain-stone.png`,
	shoreSand: `${ROOT}shore-sand.png`,
	streamBankMud: `${ROOT}stream-bank-mud.png`,
	wornEarth: `${ROOT}worn-earth.jpg`
});

const URL_BY_ROLE = Object.freeze({
	'forest-leaf-floor': LOCAL_TERRAIN_TEXTURES.forestLeafFloor,
	'meadow-source-grass': LOCAL_TERRAIN_TEXTURES.meadowWetGrass,
	'meadow-wet-grass': LOCAL_TERRAIN_TEXTURES.meadowWetGrass,
	'mountain-stone': LOCAL_TERRAIN_TEXTURES.mountainStone,
	'shore-sand': LOCAL_TERRAIN_TEXTURES.shoreSand,
	'stream-bank-mud': LOCAL_TERRAIN_TEXTURES.streamBankMud,
	'worn-earth': LOCAL_TERRAIN_TEXTURES.wornEarth
});

export function localTerrainTextureUrl(role) {
	const url = URL_BY_ROLE[role];
	if (!url) throw new Error(`Missing local terrain texture role: ${role}`);
	return url;
}

export function localTerrainTextureUrls() {
	return Object.freeze([...new Set(Object.values(LOCAL_TERRAIN_TEXTURES))]);
}
