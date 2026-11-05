// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFarmPlotDefinitions.js
 * @description Creates one supported identity anchor for each canonical farm footprint.
 * The Awtsmoos gives nourishment a measured place; Awtsmoos.com lets F01-F04 remain stable
 * names while terraces rise above their highest local soil and foundations meet the lowest.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { CANONICAL_FOOTPRINTS_BY_ID } from './CanonicalVillageFootprints.js';

export const CANONICAL_FARM_IDS = Object.freeze(['F01', 'F02', 'F03', 'F04']);

export function canonicalFarmFootprints() {
	return CANONICAL_FARM_IDS.map((id) => CANONICAL_FOOTPRINTS_BY_ID[id]);
}

export function createCanonicalFarmPlots(groundSampler) {
	return canonicalFarmFootprints().map((footprint) => {
		return createFarmPlot(footprint, groundSampler);
	});
}

function createFarmPlot(footprint, groundSampler) {
	const top = canonicalFoundationTopHeight(
		footprint.id,
		groundSampler,
		footprint.x,
		footprint.z
	);
	return {
		color: footprint.archetype === 'orchard' ? '#655036' : '#5b3f28',
		id: `Awtsmoos_${footprint.id}_plot`,
		mapRepeat: [footprint.width / 2, footprint.depth / 2],
		position: {
			x: footprint.x,
			y: top + 0.12,
			z: footprint.z
		},
		rotation: {
			y: footprint.yaw
		},
		shape: 'box',
		size: {
			x: footprint.width,
			y: 0.24,
			z: footprint.depth
		},
		solid: true,
		texturePolicy: {
			publicFirebase: true,
			role: footprint.archetype,
			tileWorld: 1.8
		},
		textureUrl: TEXTURE_URLS.terrain.tilledSoil,
		userData: {
			canonicalId: footprint.id,
			family: 'canonical-farm-terrace',
			farmId: footprint.id
		}
	};
}
