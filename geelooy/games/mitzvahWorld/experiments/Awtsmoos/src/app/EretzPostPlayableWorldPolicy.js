//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzPostPlayableWorldPolicy.js
 * @description Converts one selected world manifest into explicit post-control launch permissions and stable receipts.
 * Legacy callers remain rich by default, while official worlds can independently close terrain, cinema, district, and monitoring gates.
 */

import { eretzWorldFeatureEnabled } from './EretzWorldFeaturePolicy.js';

/**
 * Resolves one immutable post-play policy without scattering world-name checks.
 * @param {object} options Runtime options carrying the selected worldExperience.
 * @returns {Readonly<object>} Complete post-control feature policy.
 */
export function resolveEretzPostPlayableWorldPolicy(options = {}) {
	const experience = options.worldExperience || null;
	const canonicalPromotion = eretzWorldFeatureEnabled(options, 'canonicalPromotion');
	return Object.freeze({
		canonicalPromotion,
		cinematicEnvironment: eretzWorldFeatureEnabled(options, 'cinematicEnvironment'),
		cinematicHero: eretzWorldFeatureEnabled(options, 'cinematicHero'),
		cinematicLandscape: eretzWorldFeatureEnabled(options, 'cinematicLandscape'),
		deepWorldStreaming: eretzWorldFeatureEnabled(options, 'deepWorldStreaming'),
		districtStreaming: canonicalPromotion
			&& eretzWorldFeatureEnabled(options, 'districtStreaming'),
		id: experience?.id || options.worldId || 'legacy-rich-world',
		mode: canonicalPromotion ? 'rich' : 'simple',
		performanceMonitor: eretzWorldFeatureEnabled(options, 'performanceMonitor'),
		postPlayTerrainHydration: eretzWorldFeatureEnabled(options, 'postPlayTerrainHydration'),
		title: experience?.title || 'Legacy Rich World'
	});
}

/**
 * Builds the terminal receipt for an intentionally lightweight world.
 * @param {object} policy Resolved selected-world policy.
 * @param {object} priority Immediate priority receipt.
 * @param {Promise|object} terrainHydration Terrain task or disabled receipt.
 * @param {object} extras Scheduled or disabled task receipts.
 * @returns {Readonly<object>} Stable simple-world completion receipt.
 */
export function simpleWorldPostPlayableReceipt(policy, priority, terrainHydration, extras = {}) {
	return Object.freeze({
		cinematicEnvironment: extras.cinematicEnvironment || disabledWorldFeatureReceipt(),
		districts: disabledWorldFeatureReceipt(),
		enrichment: disabledWorldFeatureReceipt('simple-world-complete'),
		performanceMonitor: extras.performanceMonitor || disabledWorldFeatureReceipt(),
		policy,
		priority,
		status: 'simple-world-ready',
		terrainHydration
	});
}

/** Returns a settled immutable receipt for one feature intentionally kept closed. */
export function disabledWorldFeatureReceipt(status = 'disabled-by-world-profile') {
	return Promise.resolve(Object.freeze({ status }));
}
