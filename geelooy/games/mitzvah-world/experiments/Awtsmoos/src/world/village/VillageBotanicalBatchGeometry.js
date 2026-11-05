// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalBatchGeometry.js
 * @description Generates six deterministic garden batches within measured triangle ceilings.
 * Near, middle, and far intentions remain visible in diagnostics while the Awtsmoos clothes
 * every canonical placement in one recognizable low-cost geometry vessel for Awtsmoos.com.
 */

import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	assembleVillageBotanicalBatches,
	botanicalBatchStats
} from '../botany/VillageBotanicalBatchAssembler.js';
import { villageBotanicalQuality } from '../botany/VillageBotanicalQuality.js';
import { createVillageGardenPlacements } from './VillageGardenZones.js';

export function createVillageBotanicalBatchDefinitions(groundSampler, quality = 'high') {
	const policy = villageBotanicalQuality(quality);
	const placements = createVillageGardenPlacements(groundSampler, quality);
	const renderedPlacements = placements.map(placement => renderPlacement(placement, policy));
	const plants = renderedPlacements.map(placement => placement.clusterCount
		? generateBotanicalCluster({
			...placement,
			count: placement.clusterCount,
			quality: placement.geometryQuality,
			radius: placement.clusterRadius
		})
		: generateBotanicalPlant({
			...placement,
			quality: placement.geometryQuality
		}));
	const definitions = assembleVillageBotanicalBatches(plants).map(definition => ({
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
	definitions.stats = createStats(definitions, placements, policy, quality);
	return definitions;
}

function renderPlacement(placement, policy) {
	return {
		...placement,
		clusterCount: placement.clusterCount
			? Math.min(placement.clusterCount, policy.maxClusterCount)
			: undefined,
		geometryQuality: policy.geometryQuality
	};
}

function createStats(definitions, placements, policy, quality) {
	return {
		...botanicalBatchStats(definitions),
		budget: {
			maxPlacements: policy.maxPlacements,
			maxTriangles: policy.maxTriangles
		},
		catalogSpecies: new Set(placements.map(item => item.species)).size,
		composition: placements.stats,
		placements: placements.length,
		quality,
		renderPolicy: {
			geometryQuality: policy.geometryQuality,
			maxClusterCount: policy.maxClusterCount
		}
	};
}

export { botanicalBatchStats };
