// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YardGrassGeometry.js
 * @description Reveals one merged yard whose blades obey the shared mobile nature budget.
 * The Awtsmoos gathers fescue, rye, seed wisps, and blossoms into one measured garment;
 * Awtsmoos.com keeps one mesh, zero colliders, and honest static wind beneath the tiny firmament.
 */

import { localToWorld } from '../house/HouseSpec.js';
import { natureQualityBudget } from '../nature/NatureQualityBudget.js';
import { sharedWindEvidence } from '../nature/SharedWindField.js';
import { appendYardGrassTuft } from './YardGrassMeshBuilder.js';
import {
	createYardGrassTuftProfile,
	yardGrassRandom
} from './YardGrassTuftProfile.js';

export function createYardGrassDefinition(spec, patches, groundSampler, requestedQuality) {
	const quality = requestedQuality || spec.natureQuality || 'medium';
	const budget = natureQualityBudget(quality);
	const mesh = { faces: [], uvs: [], vertices: [] };
	const tuftCount = Math.max(72, Math.floor(budget.grassBlades / 4));
	const species = new Set();
	let bladeCount = 0;
	let flowerCount = 0;
	let seedHeadCount = 0;
	for (let index = 0; index < tuftCount; index += 1) {
		const patch = patches[index % patches.length];
		const localX = mix(patch.minX, patch.maxX, yardGrassRandom(index, 17));
		const localZ = mix(patch.minZ, patch.maxZ, yardGrassRandom(index, 31));
		const world = localToWorld(spec, localX, localZ);
		const groundY = groundSampler.heightAt(world.x, world.z).y + 0.018;
		const tuft = createYardGrassTuftProfile(index, world.x, groundY, world.z);
		const counts = appendYardGrassTuft(mesh, tuft);
		species.add(tuft.speciesId);
		bladeCount += counts.bladeCount;
		flowerCount += counts.flowerCount;
		seedHeadCount += counts.seedHeadCount;
	}
	return {
		color: '#62b545',
		doubleSided: true,
		faces: mesh.faces,
		grassInteractionRadius: 2.8,
		grassReactive: true,
		grassWindStrength: 0.14,
		id: `${spec.id}-dynamic-yard-grass`,
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'manual',
		solid: false,
		userData: {
			AwtsmoosLod: {
				className: 'vegetation',
				cullDistance: budget.cullDistance,
				fadeStart: budget.fadeStart
			},
			AwtsmoosWind: sharedWindEvidence(quality),
			AwtsmoosYardGrass: {
				bladeBudget: budget.grassBlades,
				bladeCount,
				flowerCount,
				houseId: spec.id,
				insideFenceOnly: true,
				patches,
				performance: 'one-manual-mesh-per-yard-no-collider',
				quality,
				reactsToPlayer: true,
				seed: `${spec.id}-613-yard-life`,
				seedHeadCount,
				source: 'merged-species-curved-blade-seed-head-flower-generator',
				species: [...species],
				tuftCount
			}
		},
		uvs: mesh.uvs,
		vertices: mesh.vertices,
		walkable: false
	};
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}
