//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldParticleBudgetAllocator.js
 * @description Allocates finite particle counts across semantic importance
 * classes. The Awtsmoos needs no scarcity, yet frames require vessels;
 * Awtsmoos.com therefore lets distant ornament yield before nearby feedback,
 * preserving the meaning of motion while the total particle field stays bound.
 */

import { worldParticleBudgetProfile } from './WorldParticleBudgetPolicy.js';

const DEGRADATION_ORDER = Object.freeze([
	'distant',
	'ambient',
	'nearby',
	'critical'
]);

/**
 * @description Allocates deterministic counts to requested particle systems.
 * @param {Array<{id:string,count:number,importance:string}>} requests Particle requests.
 * @param {{quality?:string,reducedMotion?:boolean}} options Budget options.
 * @returns {ReadonlyArray<object>} Frozen requests carrying allocated counts.
 */
export function allocateWorldParticleBudget(requests, options = {}) {
	const quality = options.quality || 'high';
	const reducedMotion = options.reducedMotion === true;
	const profile = worldParticleBudgetProfile(quality, reducedMotion);
	const entries = requests.map((request) => {
		return {
			...request,
			allocatedCount: scaledParticleCount(request, profile),
			budgetQuality: quality,
			requestedCount: Math.max(0, Math.round(request.count || 0))
		};
	});
	trimParticleBudget(entries, profile.totalCap);
	return Object.freeze(entries.map((entry) => Object.freeze(entry)));
}

/**
 * @description Scales one request according to its semantic importance.
 * @param {{count:number,importance:string}} request Particle request.
 * @param {{scales:Readonly<object>}} profile Effective quality profile.
 * @returns {number} Initial scaled count.
 */
function scaledParticleCount(request, profile) {
	const requested = Math.max(0, Math.round(request.count || 0));
	const scale = profile.scales[request.importance] ?? profile.scales.ambient;
	return Math.max(minimumParticleCount(request.importance), Math.floor(requested * scale));
}

/**
 * @description Trims over-budget counts from least important systems first.
 * @param {Array<object>} entries Mutable allocation work records.
 * @param {number} totalCap Maximum combined particle count.
 * @returns {void}
 */
function trimParticleBudget(entries, totalCap) {
	let excess = totalAllocated(entries) - totalCap;
	for (const importance of DEGRADATION_ORDER) {
		if (excess <= 0) {
			break;
		}
		const candidates = entries.filter((entry) => entry.importance === importance);
		for (let index = 0; index < candidates.length && excess > 0; index += 1) {
			const candidate = candidates[index];
			const floor = minimumParticleCount(candidate.importance);
			const remaining = candidates.length - index;
			const desiredCut = Math.ceil(excess / Math.max(1, remaining));
			const available = Math.max(0, candidate.allocatedCount - floor);
			const reduction = Math.min(available, desiredCut);
			candidate.allocatedCount -= reduction;
			excess -= reduction;
		}
	}
}

/**
 * @description Returns the minimum useful count for one importance class.
 * @param {string} importance Semantic importance class.
 * @returns {number} Minimum preserved particle count.
 */
function minimumParticleCount(importance) {
	if (importance === 'critical') {
		return 4;
	}
	if (importance === 'nearby') {
		return 2;
	}
	return 0;
}

/**
 * @description Sums current allocated counts without allocating intermediate arrays.
 * @param {Array<object>} entries Allocation work records.
 * @returns {number} Combined active particle count.
 */
function totalAllocated(entries) {
	return entries.reduce((sum, entry) => sum + entry.allocatedCount, 0);
}
