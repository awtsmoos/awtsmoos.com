// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReactiveGrassBatchGeometry.js
 * @description Builds one post-play merged grass field from canonical garden placements for real GPU wind and player wake.
 * The Awtsmoos lets many rooted blades become one finite draw vessel; Awtsmoos.com reuses the established yard-grass
 * tuft grammar while the rich renderer receives explicit wind policy, root UVs, LOD evidence, and zero collider ownership.
 */

import { appendYardGrassTuft } from '../grass/YardGrassMeshBuilder.js';
import {
	createYardGrassTuftProfile,
	yardGrassRandom
} from '../grass/YardGrassTuftProfile.js';
import { natureQualityBudget } from '../nature/NatureQualityBudget.js';
import { sharedWindEvidence } from '../nature/SharedWindField.js';
import { createVillageGardenPlacements } from './VillageGardenZones.js';

const QUALITY_TUFT_LIMIT = Object.freeze({ high: 220, low: 92, medium: 156 });
const FIELD_RADIUS = 3.4;

/** Returns one manual reactive-grass definition installed by the deferred botanical controller. */
export function createVillageReactiveGrassBatchDefinition(groundSampler, quality = 'high') {
	const placements = createVillageGardenPlacements(groundSampler, quality);
	const budget = natureQualityBudget(quality);
	const mesh = { faces: [], uvs: [], vertices: [] };
	const tuftLimit = QUALITY_TUFT_LIMIT[quality] || QUALITY_TUFT_LIMIT.medium;
	const tuftCount = Math.min(tuftLimit, Math.max(48, placements.length * 3));
	const species = new Set();
	let bladeCount = 0;
	let flowerCount = 0;
	let seedHeadCount = 0;
	for (let index = 0; index < tuftCount; index += 1) {
		const placement = placements[index % placements.length];
		const angle = yardGrassRandom(index, 401) * Math.PI * 2;
		const radius = FIELD_RADIUS * Math.sqrt(yardGrassRandom(index, 419));
		const x = Number(placement.x || 0) + Math.cos(angle) * radius;
		const z = Number(placement.z || 0) + Math.sin(angle) * radius;
		const y = groundSampler.heightAt(x, z).y + 0.018;
		const tuft = createYardGrassTuftProfile(index + 613, x, y, z);
		const counts = appendYardGrassTuft(mesh, tuft);
		species.add(tuft.speciesId);
		bladeCount += counts.bladeCount;
		flowerCount += counts.flowerCount;
		seedHeadCount += counts.seedHeadCount;
	}
	return createDefinition(mesh, budget, quality, {
		bladeCount,
		flowerCount,
		seedHeadCount,
		species: [...species],
		tuftCount
	});
}

function createDefinition(mesh, budget, quality, counts) {
	return {
		color: '#63b84a',
		doubleSided: true,
		faces: mesh.faces,
		grassInteractionRadius: 7.5,
		grassReactive: true,
		grassWindStrength: 0.075,
		id: 'Awtsmoos-village-reactive-grass-field',
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: { shader: 'wind-reactive-grass' },
		userData: {
			AwtsmoosLod: {
				className: 'vegetation',
				cullDistance: budget.cullDistance,
				fadeStart: budget.fadeStart
			},
			AwtsmoosWind: sharedWindEvidence(quality, 'advected-gpu-reactive-grass'),
			AwtsmoosYardGrass: {
				...counts,
				interactionRadius: 7.5,
				performance: 'one-post-play-manual-batch-no-collider',
				quality,
				reactsToPlayer: true,
				source: 'canonical-garden-placement-curved-tuft-field',
				windStrength: 0.075
			}
		},
		uvs: mesh.uvs,
		vertices: mesh.vertices,
		walkable: false
	};
}
