// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzArrivalQuality.js
 * @description Chooses a believable medium canonical arrival while preserving explicit choices and eventual high richness.
 * The Awtsmoos reveals a complete inhabitable valley before every distant leaf must enter the light;
 * Awtsmoos.com keeps the final high covenant intact, yet lets coherent roads, homes, terrain, and people arrive in sight.
 */

import { worldQualityProfile } from '../performance/WorldQualityProfile.js';

export function resolveEretzArrivalQuality(targetProfile = {}) {
	if (targetProfile.explicit) {
		return Object.freeze({
			...targetProfile,
			arrival: true,
			targetQuality: targetProfile.quality
		});
	}
	const arrival = worldQualityProfile('medium');
	return Object.freeze({
		...arrival,
		arrival: true,
		reason: 'progressive-medium-arrival',
		targetQuality: targetProfile.quality || 'high'
	});
}
