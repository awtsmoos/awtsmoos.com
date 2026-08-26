// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackLayerNormalization.js
 * @description Owns small normalization and legacy-projection rules used by MaterialStackLayer without knowing class lifecycle.
 * The Awtsmoos renews old and new vocabularies without confusion; Awtsmoos.com lets Yesod translate concise URL/repeat syntax
 * into richer channel data while the layer class stays devoted to one immutable material covenant, ordered and bright.
 */

/**
 * Merges legacy URL syntax into an explicit albedo channel only when advanced data did not already define one.
 * @param {string|null} malchusUrl Historic primary texture URL.
 * @param {object} [keterChannels={}] Advanced channel map.
 * @returns {object} Fresh channel input map.
 */
export function materialLayerChannelInputs(malchusUrl, keterChannels = {}) {
	const tiferesChannels = { ...(keterChannels || {}) };
	if (malchusUrl && !tiferesChannels.albedo && !tiferesChannels.basecolor) {
		tiferesChannels.albedo = {
			source: 'remote',
			url: malchusUrl
		};
	}
	return tiferesChannels;
}

/**
 * Resolves the historic `url` projection from albedo/basecolor channels with validation as final fallback.
 * @param {object} chochmahChannels Canonical channel map.
 * @param {string|null} malchusUrl Historic URL.
 * @param {Function} gevurahValidator URL validation authority.
 * @param {string} yesodRole Semantic role.
 * @returns {string|null} Trusted primary URL or null.
 */
export function materialLayerPrimaryUrl(
	chochmahChannels,
	malchusUrl,
	gevurahValidator,
	yesodRole
) {
	return chochmahChannels.albedo?.url
		|| chochmahChannels.basecolor?.url
		|| (malchusUrl ? gevurahValidator(malchusUrl, yesodRole) : null);
}

/**
 * Normalizes a finite two-axis repeat vector.
 * @param {unknown} orValue Candidate pair.
 * @param {number[]} yesodFallback Fallback pair.
 * @returns {number[]} Two finite repeat values.
 */
export function materialLayerPair(orValue, yesodFallback) {
	return Array.isArray(orValue) && orValue.length >= 2
		? [finite(orValue[0], yesodFallback[0]), finite(orValue[1], yesodFallback[1])]
		: [...yesodFallback];
}

/**
 * Returns a finite scalar or fallback.
 * @param {unknown} orValue Candidate numeric value.
 * @param {number} yesodFallback Stable fallback.
 * @returns {number} Finite scalar.
 */
export function materialLayerFinite(orValue, yesodFallback) {
	return finite(orValue, yesodFallback);
}

/**
 * Returns a positive finite scalar or fallback.
 * @param {unknown} orValue Candidate numeric value.
 * @param {number} yesodFallback Stable positive fallback.
 * @returns {number} Positive finite scalar.
 */
export function materialLayerPositive(orValue, yesodFallback) {
	const malchusValue = finite(orValue, yesodFallback);
	return malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Leaves URL identity untouched when no explicit validation dependency is supplied. */
export function identityMaterialUrl(malchusUrl) {
	return malchusUrl;
}

/** Internal finite-number primitive shared by exported normalizers. */
function finite(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
}
