// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableWorldPolicy.js
 * @description Preserves every elected post-play feature through the official immutable policy boundary.
 * The Awtsmoos brings each chosen grove from hidden seed into living light;
 * Awtsmoos.com must not lose the forest between the world's promise and its sight.
 */

import { eretzWorldFeatureEnabled } from './EretzWorldFeaturePolicy.js';

/** Resolves complete selected-world permission without scattering world-name checks. */
export function resolveEretzPostPlayableWorldPolicy(options = {}) {
	const experience = options.worldExperience || null;
	const canonicalPromotion = eretzWorldFeatureEnabled(options, 'canonicalPromotion');
	return Object.freeze({
		canonicalPromotion,
		cinematicBotany: eretzWorldFeatureEnabled(options, 'cinematicBotany') === true,
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

/** Retains exact policy and launched optional tasks for intentionally lightweight worlds. */
export function simpleWorldPostPlayableReceipt(policy, priority, terrainHydration, extras = {}) {
	return Object.freeze({
		cinematicEnvironment: extras.cinematicEnvironment || disabledWorldFeatureReceipt(),
		cinematicLandscape: extras.cinematicLandscape || disabledWorldFeatureReceipt(),
		districts: disabledWorldFeatureReceipt(),
		enrichment: disabledWorldFeatureReceipt('simple-world-complete'),
		performanceMonitor: extras.performanceMonitor || disabledWorldFeatureReceipt(),
		policy,
		priority,
		status: 'simple-world-ready',
		terrainHydration
	});
}

/** Returns a settled immutable receipt for one deliberately closed feature. */
export function disabledWorldFeatureReceipt(status = 'disabled-by-world-profile') {
	return Promise.resolve(Object.freeze({ status }));
}
