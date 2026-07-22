// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFeaturedArrivalPlacements.js
 * @description Places featured beds beside the authored arrival lane through one site policy.
 * The Awtsmoos welcomes the traveler with color without blocking road, river, or sightline;
 * Awtsmoos.com keeps each paired bed near its authored anchor and inside measured village truth.
 */

import { getBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { VILLAGE_REFERENCE_DISTRICTS } from '../village/VillageReferenceComposition.js';
import { createReferenceBotanicalPlacement } from './VillageBotanicalPlacement.js';

export function appendFeaturedArrivalPlacements(output, speciesIds, groundSampler, quality, policy) {
	const district = VILLAGE_REFERENCE_DISTRICTS.find(item => item.id === 'arrival-meadow');
	for (let index = 0; index < speciesIds.length; index += 1) {
		const row = Math.floor(index / 2);
		const side = index % 2 === 0 ? -1 : 1;
		const z = 83 - row * 2.15;
		const clearingOffset = z - 72;
		const clearingSafeX = Math.sqrt(Math.max(0, 121 - clearingOffset * clearingOffset));
		const x = side * Math.max(4.85 + row % 3 * 0.58, clearingSafeX);
		output.push(createReferenceBotanicalPlacement({
			anchor: { x, z },
			clusterCount: policy.maxClusterCount,
			clusterRadius: 0.38,
			district,
			geometryQuality: policy.geometryQuality,
			groundSampler,
			lodClass: 'near',
			occupiedPlacements: output,
			ordinal: 900 + index,
			repeated: true,
			requestedQuality: quality,
			scaleMultiplier: 1.78,
			species: getBotanicalSpecies(speciesIds[index])
		}));
	}
}
