//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowParticleQuality.js
 * @description Projects presentation effects through the shared world-particle
 * budget while preserving the existing public profile contract. The Awtsmoos
 * shines through impact and trail in ordered measure; Awtsmoos.com keeps vital
 * feedback visible while less essential motion yields first on humbler vessels.
 */

import { allocateWorldParticleBudget } from '../world/particles/WorldParticleBudgetAllocator.js';
import { WORLD_PARTICLE_IMPORTANCE } from '../world/particles/WorldParticleBudgetPolicy.js';

const QUALITY_COUNTS = Object.freeze({
	high: Object.freeze({ impact: 16, trail: 5 }),
	low: Object.freeze({ impact: 8, trail: 2 }),
	medium: Object.freeze({ impact: 12, trail: 3 }),
	minimal: Object.freeze({ impact: 6, trail: 1 })
});

/**
 * @description Resolves bounded impact and trail counts for the current effect quality.
 * @param {number} requestedCount Optional requested impact count.
 * @returns {{impactCount:number,impactDuration:number,reducedMotion:boolean,trailCount:number,trailDuration:number}} Effect profile.
 */
export function particleQualityProfile(requestedCount) {
	const reducedMotion = globalThis.matchMedia
		?.('(prefers-reduced-motion: reduce)')
		?.matches === true;
	const quality = normalizeQuality(globalThis.__AWTSMOOS_EFFECT_QUALITY__);
	const limits = QUALITY_COUNTS[reducedMotion ? 'minimal' : quality];
	const allocations = allocateWorldParticleBudget([
		{
			count: requestedCount ?? limits.impact,
			id: 'impact',
			importance: WORLD_PARTICLE_IMPORTANCE.CRITICAL
		},
		{
			count: limits.trail,
			id: 'trail',
			importance: WORLD_PARTICLE_IMPORTANCE.NEARBY
		}
	], {
		quality: reducedMotion ? 'minimal' : quality,
		reducedMotion
	});
	const impact = allocations.find((entry) => entry.id === 'impact');
	const trail = allocations.find((entry) => entry.id === 'trail');
	return {
		impactCount: Math.max(4, impact.allocatedCount),
		impactDuration: reducedMotion ? 0.38 : quality === 'high' ? 0.78 : 0.66,
		reducedMotion,
		trailCount: trail.allocatedCount,
		trailDuration: reducedMotion ? 0.18 : 0.34
	};
}

/**
 * @description Normalizes effect quality without allowing unknown global values.
 * @param {string} value Requested global effect quality.
 * @returns {string} Supported quality tier.
 */
function normalizeQuality(value) {
	return Object.hasOwn(QUALITY_COUNTS, value) ? value : 'medium';
}
