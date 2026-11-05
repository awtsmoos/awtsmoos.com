// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionEffects.js
 * @description Describes declared atmospheric, particle, bilingual-text, and visual-metaphor effects without constructing runtime meshes.
 * The Awtsmoos creates visible atmosphere and its meaning without confusion; Awtsmoos.com records finite ids, schema versions,
 * and scientific-claim boundaries so future posts may recreate the same effects while knowing what is physics and what is metaphor.
 */

import {
	WORLD_PARTICLE_SCHEMA_VERSION,
	WORLD_PARTICLE_SYSTEM_IDS
} from '../../world/particles/CanonicalWorldParticleSystems.js';

export function createMovieReproductionEffects(project = {}, options = {}) {
	const requested = project.metadata?.worldEffects || {};
	const particleIds = normalizeParticleIds(requested.particles);
	const runtime = options.runtimeEvidence?.effects || null;
	return Object.freeze({
		bilingualText: Object.freeze({
			enabled: requested.bilingualText === true,
			secondaryCaptionContract: 'primary-plus-secondary-v1'
		}),
		molecularVisualMetaphor: Object.freeze({
			enabled: requested.molecularVisualMetaphor === true,
			scientificClaim: 'visual-metaphor',
			systemId: 'river-garden-luminous-motes'
		}),
		particles: Object.freeze({
			enabled: particleIds.length > 0,
			schemaVersion: WORLD_PARTICLE_SCHEMA_VERSION,
			systems: Object.freeze(particleIds)
		}),
		runtime: runtime ? Object.freeze({ ...runtime }) : null,
		version: 1
	});
}

function normalizeParticleIds(value) {
	if (value === true) return [...WORLD_PARTICLE_SYSTEM_IDS];
	if (!Array.isArray(value)) return [];
	return value.map(String).filter(id => WORLD_PARTICLE_SYSTEM_IDS.includes(id));
}
