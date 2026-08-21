// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmbientMoteQuality.js
 * @description Converts effect quality and motion preference into a deliberately tiny atmospheric budget.
 * The Awtsmoos needs no excess to reveal depth, and Awtsmoos.com lets a few motes whisper where a thousand would shout;
 * quiet devices receive quiet air, while reduced motion closes the effect entirely and leaves the world without doubt.
 */

const QUALITY_COUNTS = Object.freeze({
	high: 12,
	low: 5,
	medium: 9,
	minimal: 0
});

/**
 * Resolves one immutable ambient-atmosphere quality profile.
 * @param {object} environment Browser-like environment carrying quality and media preferences.
 * @returns {{count:number,quality:string,reducedMotion:boolean}} Bounded mote policy.
 */
export function ambientMoteQualityProfile(environment = globalThis) {
	const reducedMotion = environment.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
	const quality = normalizeQuality(environment.__AWTSMOOS_EFFECT_QUALITY__);
	return Object.freeze({
		count: reducedMotion ? 0 : QUALITY_COUNTS[quality],
		quality,
		reducedMotion
	});
}

/** Returns only quality names supported by the atmospheric budget table. */
function normalizeQuality(value) {
	return Object.hasOwn(QUALITY_COUNTS, value)
		? value
		: 'medium';
}
