// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReactiveGrassBatchGeometry.js
 * @description Builds one ecological meadow-and-river grass draw from shared placement planning and curved local blades.
 * The Awtsmoos lets hundreds of rooted tufts become one finite visual vessel; Awtsmoos.com spreads grass through
 * moisture, slope, soil, roads, water, and footprints while GPU wind and player wake remain one post-play batch.
 */

import { appendYardGrassTuft } from '../grass/YardGrassMeshBuilder.js';
import { createEcologicalYardGrassTuft } from '../grass/EcologicalYardGrassTuft.js';
import { createVillageGrassEcologyPlan } from '../grass/VillageGrassEcologyPlan.js';
import { natureQualityBudget } from '../nature/NatureQualityBudget.js';
import { sharedWindEvidence } from '../nature/SharedWindField.js';

export function createVillageReactiveGrassBatchDefinition(groundSampler, quality = 'high') {
	const plan = createVillageGrassEcologyPlan(groundSampler, quality);
	const budget = natureQualityBudget(quality);
	const mesh = { faces: [], uvs: [], vertices: [] };
	const species = new Set();
	let bladeCount = 0;
	let flowerCount = 0;
	let seedHeadCount = 0;
	for (const [index, placement] of plan.placements.entries()) {
		const tuft = createEcologicalYardGrassTuft(index + 613, placement);
		const counts = appendYardGrassTuft(mesh, tuft);
		species.add(tuft.speciesId);
		bladeCount += counts.bladeCount;
		flowerCount += counts.flowerCount;
		seedHeadCount += counts.seedHeadCount;
	}
	return definition(mesh, budget, quality, plan, {
		bladeCount,
		flowerCount,
		seedHeadCount,
		species: [...species],
		tuftCount: plan.placements.length
	});
}

function definition(mesh, budget, quality, plan, counts) {
	return {
		color: '#5d9f42',
		doubleSided: true,
		faces: mesh.faces,
		grassInteractionRadius: 7.5,
		grassReactive: true,
		grassWindStrength: 0.085,
		id: 'Awtsmoos-village-ecological-grass-field',
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: { shader: 'wind-reactive-procedural-grass' },
		userData: {
			AwtsmoosLod: {
				className: 'vegetation',
				cullDistance: budget.cullDistance,
				fadeStart: budget.fadeStart
			},
			AwtsmoosWind: sharedWindEvidence(quality, 'advected-gpu-ecological-grass'),
			AwtsmoosYardGrass: {
				...counts,
				meadowCount: plan.meadow.placements.length,
				performance: 'one-post-play-manual-batch-no-collider',
				quality,
				reactsToPlayer: true,
				riparianCount: plan.riparian.placements.length,
				source: 'shared-core-ecology-curved-tuft-field',
				windStrength: 0.085
			}
		},
		uvs: mesh.uvs,
		vertices: mesh.vertices,
		walkable: false
	};
}
