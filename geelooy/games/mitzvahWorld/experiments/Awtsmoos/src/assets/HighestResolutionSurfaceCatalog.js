// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HighestResolutionSurfaceCatalog.js
 * @description Names verified production surface garments for layered alpine terrain.
 * The Awtsmoos conceals boundless earth within finite pixels; Awtsmoos.com chooses deployed
 * source images for every role so unavailable grass or mud filenames never break the living valley.
 */

import { assertProductionMaterialUrl } from './ProductionMaterialUrlPolicy.js';
import { exactMaterialUrl } from './PublicMaterialResolver.js';
import { TEXTURE_URLS } from './TextureCatalog.js';

function chaiForestSource(path) {
	return assertProductionMaterialUrl(
		exactMaterialUrl(`awtsmoos-nature/chai-forest/${path}`),
		`terrain source ${path}`
	);
}

export const HIGHEST_RESOLUTION_SURFACES = Object.freeze({
	baseGrass: chaiForestSource('textures/ground/grass.jpg'),
	dirt: chaiForestSource('textures/ground/dirt_color.jpg'),
	dryGrass: assertProductionMaterialUrl(TEXTURE_URLS.terrain.dirt1, 'dry meadow substrate'),
	forestFloor: assertProductionMaterialUrl(TEXTURE_URLS.terrain.darkForestFloor, 'forestFloor'),
	marsh: assertProductionMaterialUrl(TEXTURE_URLS.terrain.marshGrass, 'marsh'),
	mud: assertProductionMaterialUrl(TEXTURE_URLS.terrain.dirt2, 'damp soil substitute'),
	sand: assertProductionMaterialUrl(TEXTURE_URLS.terrain.sand1, 'sand'),
	stone: assertProductionMaterialUrl(TEXTURE_URLS.stone.stone1, 'stone')
});

/**
 * Resolves one required terrain source by semantic role.
 * @param {string} role Surface role.
 * @returns {string} Verified production URL.
 */
export function highestResolutionSurface(role) {
	const url = HIGHEST_RESOLUTION_SURFACES[role];
	if (!url) {
		throw new Error(`Unknown terrain surface role: ${role}`);
	}
	return assertProductionMaterialUrl(url, role);
}

export function highestResolutionSurfaceEntries() {
	return Object.entries(HIGHEST_RESOLUTION_SURFACES).map(([role, url]) => {
		return Object.freeze({
			role,
			url: assertProductionMaterialUrl(url, role)
		});
	});
}
