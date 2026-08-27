// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBushBatchGeometry.js
 * @description Replaces octahedron shrubs with shared-core botanical organisms merged into three static draws.
 * The Awtsmoos lets each authored hedgerow and woodland margin grow stems, leaves, and blooms in distinct form;
 * Awtsmoos.com keeps every plant procedural and bitmap-free while green, bloom, and accent organs gather into three batches warm.
 */

import { generateRealisticBotanicalPlant } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/botany/BotanicalRealism.js';
import {
	AUTHORED_BUSH_CLUSTERS,
	AUTHORED_BUSH_COUNT,
	createAuthoredBushPlacements
} from './VillageBushPlacement.js';
import {
	appendBotanicalPayload,
	createBotanicalRoleBatches
} from './VillageBotanicalBatchMerge.js';
import { villageBushSpecies } from './VillageBushSpecies.js';

const PLACEMENT_MODEL = 'canonical-biome-realistic-botany';

export function createBushBatchDefinitions(groundSampler) {
	const placements = createAuthoredBushPlacements(groundSampler);
	const batches = createBotanicalRoleBatches();
	for (const [index, placement] of placements.entries()) {
		const species = villageBushSpecies(placement, index);
		const groundY = placement.y - placement.radius * 0.68;
		const payload = generateRealisticBotanicalPlant({
			growth: 0.82 + (index % 5) * 0.035,
			position: { x: placement.x, y: groundY, z: placement.z },
			quality: 'medium',
			scale: placement.radius / 1.05,
			season: 'summer',
			seed: `${placement.clusterId}:${index}`,
			species,
			wind: [0.08, 0, 0.03]
		});
		appendBotanicalPayload(batches, payload);
	}
	return [...batches.values()]
		.filter(batch => batch.faces.length)
		.map(batch => batchDefinition(batch, placements));
}

export function bushBatchStats(definitions) {
	return definitions.reduce((summary, definition) => {
		summary.batches += 1;
		summary.instances += definition.userData?.instances || 0;
		summary.triangles += definition.faces.length;
		return summary;
	}, { batches: 0, instances: 0, triangles: 0 });
}

function batchDefinition(batch, placements) {
	return {
		backfaceCull: true,
		color: batch.color,
		doubleSided: batch.role !== 'accent',
		faces: batch.faces,
		id: `Awtsmoos_living_botanical_bush_${batch.role}`,
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			role: `botanical-${batch.role}`,
			shader: 'procedural-botanical-wind'
		},
		userData: {
			AwtsmoosLod: { className: 'vegetation' },
			biomeIds: [...new Set(placements.map(item => item.intendedBiomeId))],
			clusterCount: AUTHORED_BUSH_CLUSTERS.length,
			family: 'village-botanical-bushes',
			instances: batch.instances,
			placementModel: PLACEMENT_MODEL,
			staticBatch: true
		},
		vertices: batch.vertices
	};
}
