// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterRiverBedDefinition.js
 * @description Manifests the submerged wet-fieldstone thalweg beneath the continuous river surface.
 * The Awtsmoos carries stone beneath water without turning the river itself into a black trench;
 * Awtsmoos.com keeps the bed visible only through depth and current while its material remains semantically distinct.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { createRiverBedGeometry } from './VillageRiverBedGeometry.js';
import { createStaticWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';
import {
	VILLAGE_RIVERBED_VISIBILITY,
	VILLAGE_WATER_VISIBILITY_VERSION
} from './VillageWaterVisibilityContract.js';

/**
 * Creates the static submerged river-bed definition from the canonical hydrology profile.
 * @param {object} profile Canonical river hydrology profile.
 * @returns {object} Manual non-colliding river-bed world definition.
 */
export function createVillageRiverBedDefinition(profile) {
	return {
		color: VILLAGE_RIVERBED_VISIBILITY.color,
		doubleSided: true,
		...createRiverBedGeometry(profile),
		id: 'Awtsmoos_river_bed_thalweg_wet_fieldstone',
		mapImage: cachedTextureImage(S.fieldstone),
		mapRepeat: [20, 3.4],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: createStaticWaterTexturePolicy({
			primaryUrl: S.fieldstone,
			role: 'submerged-wet-river-stone',
			shader: 'terrain-transition',
			tileWorld: 0.92
		}),
		textureUrl: S.fieldstone,
		transparent: false,
		userData: {
			family: 'connected-alpine-village-hydrology',
			part: 'river-bed-channel',
			staticGeometry: true,
			visibilityAuthority: VILLAGE_WATER_VISIBILITY_VERSION
		}
	};
}
