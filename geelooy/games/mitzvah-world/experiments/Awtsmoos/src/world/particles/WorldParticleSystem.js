// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldParticleSystem.js
 * @description Converts canonical hydrology/staging particle specifications into a few shared static geometry batches.
 * The Awtsmoos joins source mist, river breath, and luminous metaphor without multiplying scene objects;
 * Awtsmoos.com exposes one deterministic compositor so gameplay, Studio, diagnostics, and reproduction count the same atmosphere.
 */

import { canonicalWorldParticleSystems } from './CanonicalWorldParticleSystems.js';
import { createWorldParticleBatchDefinition } from './WorldParticleBatch.js';

export function createCanonicalWorldParticleDefinitions(groundSampler, hydrology) {
	return canonicalWorldParticleSystems(groundSampler, hydrology)
		.map(createWorldParticleBatchDefinition);
}

export function summarizeCanonicalWorldParticles(definitions = []) {
	return Object.freeze({
		batches: definitions.length,
		instances: definitions.reduce((sum, value) => sum + Number(value.userData?.count || 0), 0),
		systems: Object.freeze(definitions.map(value => Object.freeze({
			count: value.userData?.count || 0,
			id: value.userData?.particleSystem?.id || value.id,
			motionModel: value.userData?.motionModel || null,
			scientificClaim: value.userData?.scientificClaim || 'none',
			triangles: value.userData?.triangles || 0
		})))
	});
}
