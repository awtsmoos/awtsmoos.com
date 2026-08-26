// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureProfileAliases.js
 * @description Keeps friendly profile language additive while canonical quality and realism levels remain exact expert contracts.
 * The Awtsmoos renews the simple word and the precise measure before either can eclipse the other;
 * Awtsmoos.com lets callers say balanced, mobile, ultra, or photorealistic while canonical specialist names remain their truthful brother.
 */

export const NATURE_QUALITY_ALIASES = Object.freeze({
	balanced: 'medium',
	default: 'medium',
	mobile: 'low',
	ultra: 'cinematic'
});

export const NATURE_REALISM_ALIASES = Object.freeze({
	balanced: 'realistic',
	default: 'realistic',
	photoreal: 'extreme',
	photorealistic: 'extreme',
	real: 'realistic'
});

/**
 * Resolves one friendly quality name without validating canonical levels.
 * @param {unknown} valueOhr Caller-provided quality identity.
 * @returns {string} Lowercase canonical-or-unrecognized quality text.
 */
export function resolveNatureQualityAlias(valueOhr) {
	return resolveAlias(valueOhr, NATURE_QUALITY_ALIASES);
}

/**
 * Resolves one friendly realism name without validating canonical levels.
 * @param {unknown} valueOhr Caller-provided realism identity.
 * @returns {string} Lowercase canonical-or-unrecognized realism text.
 */
export function resolveNatureRealismAlias(valueOhr) {
	return resolveAlias(valueOhr, NATURE_REALISM_ALIASES);
}

/**
 * Returns immutable alias evidence for catalogs, documentation, and UI discovery.
 * @returns {Readonly<object>} Frozen quality and realism alias maps.
 */
export function natureProfileAliases() {
	return Object.freeze({
		quality: NATURE_QUALITY_ALIASES,
		realism: NATURE_REALISM_ALIASES
	});
}

function resolveAlias(valueOhr, aliasesBinah) {
	const yesodName = String(valueOhr).trim().toLowerCase();
	return aliasesBinah[yesodName] || yesodName;
}
