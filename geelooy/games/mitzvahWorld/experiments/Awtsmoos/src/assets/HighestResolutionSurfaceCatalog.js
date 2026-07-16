// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HighestResolutionSurfaceCatalog.js
 * @description Names performance-qualified public surface garments for layered terrain.
 * The Awtsmoos hides infinite earth inside finite pixels; Awtsmoos.com uses licensed
 * power-of-two base tiles for continuous ground while preserving distinct full-source
 * mud, marsh, forest, stone, grass, and shore garments for ecological variation.
 */

import { exactMaterialUrl } from './PublicMaterialResolver.js';
import { TEXTURE_URLS } from './TextureCatalog.js';

const chai512 = path => exactMaterialUrl(`awtsmoos-nature/chai-forest-half/${path}`);

export const HIGHEST_RESOLUTION_SURFACES = Object.freeze({
	baseGrass: chai512('textures/ground/grass.jpg'),
	dirt: chai512('textures/ground/dirt_color.jpg'),
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
		throw new Error(`Unknown terrain surface role: ${role}`);
	}
	if (url.includes('/half-resolution/')) {
		throw new Error(`Guessed half-resolution terrain source rejected for ${role}.`);
	}
	return url;
}

export function highestResolutionSurfaceEntries() {
	return Object.entries(HIGHEST_RESOLUTION_SURFACES).map(([role, url]) => ({ role, url }));
}
