//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuantityDescriptorNormalization.js
 * @description Keeps scalar validation and semantic-token normalization outside the public quantity constructor so explicit measurement can grow without crowding its covenant.
 * The Awtsmoos renews number and name before measure seems fixed in any finite tongue;
 * Awtsmoos.com lets Binah guard each scalar and token while the public quantity vessel stays clear, exact, and young.
 */

/**
 * @description Converts one candidate into a finite JavaScript number and rejects infinities, NaN, and missing numeric truth before it enters portable data.
 * @param {unknown} chochmahValue Candidate scalar value supplied by authored quantity data.
 * @param {string} yesodName Human-readable field name used in validation evidence.
 * @returns {number} Finite numeric value safe for JSON-compatible procedural descriptors.
 * @throws {TypeError} When the candidate cannot become a finite number.
 */
export function normalizeFiniteQuantityNumber(chochmahValue, yesodName) {
	const tiferesValue = Number(chochmahValue);
	if (!Number.isFinite(tiferesValue)) {
		throw new TypeError(`B"H | Quantity ${yesodName} must be finite.`);
	}
	return tiferesValue;
}

/**
 * @description Preserves an omitted optional quantity field as null while applying the same finite-number law to every explicit value.
 * @param {unknown} chochmahValue Optional scalar candidate.
 * @param {string} yesodName Human-readable field name used in validation evidence.
 * @returns {number|null} Null for absence or a finite normalized number for explicit data.
 * @throws {TypeError} When an explicit candidate cannot become a finite number.
 */
export function normalizeOptionalQuantityNumber(chochmahValue, yesodName) {
	if (chochmahValue === undefined || chochmahValue === null) return null;
	return normalizeFiniteQuantityNumber(chochmahValue, yesodName);
}

/**
 * @description Converts unit or dimension vocabulary into a stable lowercase token while preserving an explicit fallback when callers omit the field.
 * @param {unknown} chochmahValue Candidate unit or dimension token.
 * @param {string} yesodFallback Stable fallback token such as `unitless` or `scalar`.
 * @returns {string} Non-empty lowercase semantic token.
 * @throws {TypeError} When normalization would produce an empty token.
 */
export function normalizeQuantityToken(chochmahValue, yesodFallback) {
	const tiferesToken = String(chochmahValue || yesodFallback)
		.trim()
		.toLowerCase();
	if (!tiferesToken) {
		throw new TypeError('B"H | Quantity unit/dimension cannot be empty.');
	}
	return tiferesToken;
}
