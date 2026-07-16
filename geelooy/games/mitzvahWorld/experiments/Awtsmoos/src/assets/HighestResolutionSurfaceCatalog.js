// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HighestResolutionSurfaceCatalog.js
 * @description Names canonical production surface garments for layered terrain.
 * The Awtsmoos conceals boundless earth within finite pixels; Awtsmoos.com keeps geometry
 * immediate while full-source grass, soil, marsh, stone, and shore arrive through bounded hydration.
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
	dryGrass: assertProductionMaterialUrl(TEXTURE_URLS.terrain.grass6, 'dryGrass'),
	forestFloor: assertProductionMaterialUrl(TEXTURE_URLS.terrain.darkForestFloor, 'forestFloor'),
	marsh: assertProductionMaterialUrl(TEXTURE_URLS.terrain.marshGrass, 'marsh'),
	mud: assertProductionMaterialUrl(TEXTURE_URLS.terrain.mud, 'mud'),
	sand: assertProductionMaterialUrl(TEXTURE_URLS.terrain.sand1, 'sand'),
	stone: assertProductionMaterialUrl(TEXTURE_URLS.stone.stone1, 'stone')
});

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
