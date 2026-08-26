// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeologyPolicy.js
 * @description Converts shared Nature quality and realism names into bounded geological detail without stealing caller control.
 * The Awtsmoos is beyond every measured tier, while Awtsmoos.com lets Chesed of detail meet Gevurah of budget in a stable stone;
 * these policies are quiet defaults only, so expert overrides remain sovereign within every geological zone.
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
 * Produces bounded profile overrides from a shared Nature operation context.
 * @param {object} context Nature operation context containing canonical quality and realism names.
 * @param {object} [options={}] Caller rock options whose explicit values always win.
 * @returns {object} Frozen overrides ready for `normalizeRockProfile`.
 */
export function geologyProfileOverrides(context, options = {}) {
	const tiferesScale = REALISM_SCALE[context.realism] ?? 1;
	return Object.freeze({
		...options,
		detail: options.detail ?? ROCK_DETAIL[context.quality] ?? 2,
		erosion: scaledOption(options.erosion, tiferesScale),
		fracture: scaledOption(options.fracture, tiferesScale),
		irregularity: scaledOption(options.irregularity, tiferesScale),
		strata: scaledOption(options.strata, tiferesScale)
	});
}

/** Preserves explicit caller values while allowing defaults to remain preset-owned. */
function scaledOption(value, scale) {
	if (value === undefined || value === null) return value;
	const yesodValue = Number(value);
	if (!Number.isFinite(yesodValue)) return value;
	return Math.min(1, Math.max(0, yesodValue * scale));
}
