// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalWorldParticleSystems.js
 * @description Declares bounded deterministic mist, pollen, and metaphorical mote fields from real hydrology and staging anchors.
 * The Awtsmoos creates droplet, dust, and luminous point within one world; Awtsmoos.com keeps every finite field subtle,
 * so gameplay and Studio share atmospheric depth without cyan confetti or pretending a visual metaphor is chemistry.
 */

import { canonicalVillageLocationStaging } from '../village/CanonicalVillageLocationStaging.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';

export const WORLD_PARTICLE_SCHEMA_VERSION = '2026.08-world-particles-v1';
export const WORLD_PARTICLE_SYSTEM_IDS = Object.freeze([
	'spring-mist-droplets',
	'lower-river-micro-mist',
	'river-garden-luminous-motes'
]);

export function canonicalWorldParticleSystems(groundSampler, hydrology) {
	const source = hydrology?.points?.[0];
	const river = hydrology?.points?.[Math.floor((hydrology.points.length - 1) * 0.72)];
	const actor = canonicalVillageLocationStaging('river-garden')
		.find(value => value.role === 'cinematic-actor');
	if (!source || !river || !actor) throw new Error('Canonical particle systems require hydrology and river-garden staging.');
	const actorY = villageGroundHeight(groundSampler, actor.position.x, actor.position.z);
	return Object.freeze([
		system(WORLD_PARTICLE_SYSTEM_IDS[0], [source.x, source.y + 0.7, source.z], 6131, 96, '#edf4f0', 0.16, [4.5, 2.2, 5.8], [0.018, 0.052], 'buoyant-water-mist'),
		system(WORLD_PARTICLE_SYSTEM_IDS[1], [river.x, river.y + 0.38, river.z], 6132, 72, '#dce9df', 0.095, [10, 1.8, 11], [0.014, 0.038], 'slow-river-drift'),
		system(WORLD_PARTICLE_SYSTEM_IDS[2], [actor.position.x, actorY + 2.7, actor.position.z], 6133, 84, '#d8b86d', 0.085, [8, 5.8, 8], [0.012, 0.032], 'orbital-brownian-visual-metaphor', 'visual-metaphor')
	]);
}

function system(id, anchor, seed, count, color, opacity, bounds, size, motionModel, scientificClaim = 'none') {
	return Object.freeze({
		anchor: Object.freeze(anchor),
		bounds: Object.freeze(bounds),
		color,
		count,
		id,
		motionModel,
		opacity,
		schemaVersion: WORLD_PARTICLE_SCHEMA_VERSION,
		scientificClaim,
		seed,
		size: Object.freeze(size)
	});
}
