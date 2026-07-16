// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HighestResolutionSurfaceCatalog.js
 * @description Names only full-resolution public surface garments for layered terrain.
 * The Awtsmoos hides infinite earth inside finite pixels; Awtsmoos.com therefore chooses
 * the largest declared grass, soil, stone, marsh, forest, and shore vessels without half copies.
 */

import { TEXTURE_URLS } from './TextureCatalog.js';

export const HIGHEST_RESOLUTION_SURFACES = Object.freeze({
	baseGrass: TEXTURE_URLS.terrain.grass1,
	dirt: TEXTURE_URLS.terrain.dirtGrass3,
	dryGrass: TEXTURE_URLS.terrain.grass6,
	forestFloor: TEXTURE_URLS.terrain.darkForestFloor,
	marsh: TEXTURE_URLS.terrain.marshGrass,
	mud: TEXTURE_URLS.terrain.mud,
	sand: TEXTURE_URLS.terrain.sand1,
	stone: TEXTURE_URLS.stone.stone1
});

export function highestResolutionSurface(role) {
	const url = HIGHEST_RESOLUTION_SURFACES[role];
	if (!url) {
		throw new Error(`Unknown full-resolution terrain surface role: ${role}`);
	}
	if (url.includes('/half-resolution/')) {
		throw new Error(`Half-resolution terrain source rejected for ${role}.`);
	}
	return url;
}

export function highestResolutionSurfaceEntries() {
	return Object.entries(HIGHEST_RESOLUTION_SURFACES).map(([role, url]) => ({ role, url }));
}
