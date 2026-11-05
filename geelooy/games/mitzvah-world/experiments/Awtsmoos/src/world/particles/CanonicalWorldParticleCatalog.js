//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CanonicalWorldParticleCatalog.js
 * @description Names the village atmosphere as semantic particle requests before
 * quality budgeting or rendering. The Awtsmoos joins spring, river, and garden
 * in one breathing world; Awtsmoos.com keeps each finite recipe inspectable so
 * future leaves, fireflies, rain, embers, and dust can enter without a monolith.
 */

import { WORLD_PARTICLE_IMPORTANCE } from './WorldParticleBudgetPolicy.js';

export const WORLD_PARTICLE_SYSTEM_IDS = Object.freeze([
	'spring-mist-droplets',
	'lower-river-micro-mist',
	'river-garden-luminous-motes'
]);

/**
 * @description Builds canonical semantic requests from resolved world anchors.
 * @param {object} source Spring hydrology point.
 * @param {object} river Lower-river hydrology point.
 * @param {object} actor River-garden staging actor.
 * @param {number} actorY Terrain height below the staging actor.
 * @returns {Array<object>} Ordered particle requests for budget allocation.
 */
export function canonicalWorldParticleRequests(source, river, actor, actorY) {
	return [
		request({
			anchor: [source.x, source.y + 0.7, source.z],
			bounds: [4.5, 2.2, 5.8],
			color: '#edf4f0',
			count: 96,
			id: WORLD_PARTICLE_SYSTEM_IDS[0],
			importance: WORLD_PARTICLE_IMPORTANCE.NEARBY,
			motionModel: 'buoyant-water-mist',
			opacity: 0.16,
			seed: 6131,
			size: [0.018, 0.052]
		}),
		request({
			anchor: [river.x, river.y + 0.38, river.z],
			bounds: [10, 1.8, 11],
			color: '#dce9df',
			count: 72,
			id: WORLD_PARTICLE_SYSTEM_IDS[1],
			importance: WORLD_PARTICLE_IMPORTANCE.AMBIENT,
			motionModel: 'slow-river-drift',
			opacity: 0.095,
			seed: 6132,
			size: [0.014, 0.038]
		}),
		request({
			anchor: [actor.position.x, actorY + 2.7, actor.position.z],
			bounds: [8, 5.8, 8],
			color: '#d8b86d',
			count: 84,
			id: WORLD_PARTICLE_SYSTEM_IDS[2],
			importance: WORLD_PARTICLE_IMPORTANCE.DISTANT,
			motionModel: 'orbital-brownian-visual-metaphor',
			opacity: 0.085,
			scientificClaim: 'visual-metaphor',
			seed: 6133,
			size: [0.012, 0.032]
		})
	];
}

/**
 * @description Normalizes one catalog entry into the allocator request contract.
 * @param {object} options Semantic particle request fields.
 * @returns {object} Renderer-neutral particle request.
 */
function request(options) {
	return {
		...options,
		scientificClaim: options.scientificClaim || 'none'
	};
}
