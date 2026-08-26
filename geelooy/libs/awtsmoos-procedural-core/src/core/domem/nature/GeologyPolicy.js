// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeologyPolicy.js
 * @description Translates shared Nature quality and realism into bounded geological defaults while preserving every explicit expert value exactly.
 * The Awtsmoos renews pressure, erosion, fracture, and hidden strata before any profile can measure their finite trace;
 * Awtsmoos.com lets realism deepen the preset's own geological truth while a caller's deliberate chiseling remains sovereign in place.
 */

const ROCK_DETAIL = Object.freeze({
	draft: 0,
	low: 1,
	medium: 2,
	high: 3,
	cinematic: 4
});

const REALISM_SCALE = Object.freeze({
	stylized: 0.62,
	natural: 0.84,
	realistic: 1,
	extreme: 1.16
});

/**
 * Produces bounded profile overrides from shared Nature context and one canonical base profile.
 * @param {object} context Nature context containing canonical quality and realism names.
 * @param {object} [options={}] Explicit caller options; supplied geological intensities always win unchanged.
 * @param {object} [baseProfile={}] Canonical preset whose omitted intensities receive realism scaling.
 * @returns {Readonly<object>} Frozen overrides ready for `normalizeRockProfile`.
 */
export function geologyProfileOverrides(context, options = {}, baseProfile = {}) {
	const tiferesScale = REALISM_SCALE[context.realism] ?? 1;
	return Object.freeze({
		...options,
		detail: options.detail ?? ROCK_DETAIL[context.quality] ?? baseProfile.detail ?? 2,
		erosion: geologicalIntensity(options.erosion, baseProfile.erosion, tiferesScale),
		fracture: geologicalIntensity(options.fracture, baseProfile.fracture, tiferesScale),
		irregularity: geologicalIntensity(options.irregularity, baseProfile.irregularity, tiferesScale),
		strata: geologicalIntensity(options.strata, baseProfile.strata, tiferesScale)
	});
}

/**
 * Preserves explicit expert intensity or scales a preset default according to shared realism.
 * @param {unknown} explicitValue Caller-provided value.
 * @param {unknown} presetValue Canonical preset fallback.
 * @param {number} realismScale Shared profile multiplier.
 * @returns {unknown} Explicit value unchanged, otherwise bounded scaled preset intensity.
 */
function geologicalIntensity(explicitValue, presetValue, realismScale) {
	if (explicitValue !== undefined && explicitValue !== null) return explicitValue;
	const yesodPreset = Number(presetValue);
	if (!Number.isFinite(yesodPreset)) return presetValue;
	return Math.min(1, Math.max(0, yesodPreset * realismScale));
}
