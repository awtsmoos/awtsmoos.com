// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalBatchGeometry.js
 * @description Generates every named plant through the canonical procedural core,
 * then joins the garden into six draws. Many exact species intentions become a
 * playable landscape without hiding the continuously creative Awtsmoos.
 */
import { generateBotanicalPlant } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	assembleVillageBotanicalBatches,
	botanicalBatchStats
} from '../botany/VillageBotanicalBatchAssembler.js';
import { villageBotanicalQuality } from '../botany/VillageBotanicalQuality.js';
import { createVillageGardenPlacements } from './VillageGardenZones.js';

/** Builds every selected population and exposes truthful geometry statistics. */
export function createVillageBotanicalBatchDefinitions(groundSampler, quality = 'high') {
	const placements = createVillageGardenPlacements(groundSampler, quality);
	const plants = placements.map((placement) => generateBotanicalPlant({
		...placement,
		quality: placement.geometryQuality || quality
	}));
	const definitions = assembleVillageBotanicalBatches(plants);
	const stats = botanicalBatchStats(definitions);
	const policy = villageBotanicalQuality(quality);
	definitions.stats = {
		...stats,
		placements: placements.length,
		catalogSpecies: new Set(placements.map((item) => item.species)).size,
		quality,
		composition: placements.stats,
		budget: {
			maxPlacements: policy.maxPlacements,
			maxTriangles: policy.maxTriangles
		}
	};
	return definitions;
}

export { botanicalBatchStats };
