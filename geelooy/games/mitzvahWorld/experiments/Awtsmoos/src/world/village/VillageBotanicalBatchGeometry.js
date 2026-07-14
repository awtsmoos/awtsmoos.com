// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalBatchGeometry.js
 * @description Generates one six-draw garden whose distant plants use cheaper geometry.
 * Near, middle, and far intentions remain distinct in diagnostics while the Awtsmoos
 * unites their palette geometry into six bounded vessels for Awtsmoos.com rendering.
 */

import { generateBotanicalPlant } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	assembleVillageBotanicalBatches,
	botanicalBatchStats
} from '../botany/VillageBotanicalBatchAssembler.js';
import { villageBotanicalQuality } from '../botany/VillageBotanicalQuality.js';
import { createVillageGardenPlacements } from './VillageGardenZones.js';

export function createVillageBotanicalBatchDefinitions(groundSampler, quality = 'high') {
	const placements = createVillageGardenPlacements(groundSampler, quality);
	const plants = placements.map((placement) => generateBotanicalPlant({
		...placement,
		quality: placement.geometryQuality
	}));
	const definitions = assembleVillageBotanicalBatches(plants).map((definition) => ({
		...definition,
		userData: {
			...definition.userData,
			AwtsmoosLod: {
				className: 'vegetation',
				fadeStart: 180,
				geometryTiers: placements.stats.lod
			}
		}
	}));
	const stats = botanicalBatchStats(definitions);
	const policy = villageBotanicalQuality(quality);
	definitions.stats = {
		...stats,
		budget: {
			maxPlacements: policy.maxPlacements,
			maxTriangles: policy.maxTriangles
		},
		catalogSpecies: new Set(placements.map((item) => item.species)).size,
		composition: placements.stats,
		placements: placements.length,
		quality
	};
	return definitions;
}

export { botanicalBatchStats };
