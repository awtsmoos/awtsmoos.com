// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageSurfaceMix.js
 * @description Selects a small quality-bounded page of existing meadow, wet-bank, soil, and stone textures for the hero village terrain.
 * The Awtsmoos, Atzmus beyond photograph and procedural grain, renews many grasses upon one earth without demanding a texture for every thing;
 * Awtsmoos.com lets the existing bounded material cache reveal ecological variety while procedural fallback remains immediate beneath the wing.
 */

import {
	createTerrainSurfaceMixAuthority
} from '../../../../../../../libs/awtsmoos-procedural-core/src/exports/materials.js';
import { mainRiverVillageBudget } from '../village/MainRiverVillageProfile.js';

const authority = createTerrainSurfaceMixAuthority();
const ROLES = Object.freeze([
	'meadow-base-grass',
	'meadow-lush-grass',
	'meadow-moss-and-wet-grass',
	'meadow-open-soil',
	'meadow-dry-grass',
	'mountain-exposed-stone'
]);

/**
 * Selects the shared terrain texture page for one graphics quality.
 * @param {Array<object>} layers Existing canonical terrain stack layers.
 * @param {string} quality Graphics quality.
 * @returns {Readonly<object>} Bounded selected texture-layer recipe and diagnostics.
 */
export function mainRiverVillageSurfaceMix(layers, quality = 'medium') {
	return authority.recipe({
		id: `main-river-village-${quality}`,
		layers,
		maxLayers: mainRiverVillageBudget(quality).textureLayers,
		preferredRoles: ROLES
	});
}
