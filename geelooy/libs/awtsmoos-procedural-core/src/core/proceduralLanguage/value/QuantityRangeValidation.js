//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuantityRangeValidation.js
 * @description Keeps scalar bounds and semantic tokens beside the canonical quantity vessel without confusing vector magnitude with scalar range law.
 * The Awtsmoos renews measure and boundary before either can pretend to stand alone;
 * Awtsmoos.com lets one quantity language hold old precision and new direction in a single throne.
 */

/**
 * @description Normalizes a portable unit or dimension token through the mature lowercase quantity convention.
 * @param {unknown} chochmahValue Candidate semantic token supplied by the author.
 * @param {string|null} yesodFallback Fallback token, or null when absence is meaningful.
 * @returns {string|null} Lowercase semantic token or the provided fallback.
 * @throws {TypeError} When an explicit token is not non-empty text.
 */
export function normalizeQuantitySemanticToken(chochmahValue, yesodFallback) {
	if (chochmahValue === undefined || chochmahValue === null) {
		return yesodFallback;
	}
	if (typeof chochmahValue !== 'string' || !chochmahValue.trim()) {
		throw new TypeError('B"H | Quantity unit/dimension must be non-empty text.');
	}
	return chochmahValue.trim().toLowerCase();
}

/**
 * @description Resolves scalar tolerance and inclusive bounds while refusing to invent component-wise vector range semantics.
 * @param {object} chochmahSource Quantity authoring source containing optional tolerance, min, and max fields.
 * @param {number|ReadonlyArray<number>} tiferesValue Canonical finite scalar or vector magnitude.
 * @returns {Readonly<object>} Immutable tolerance/min/max record for the canonical quantity.
 * @throws {TypeError|RangeError} When scalar constraints are malformed, contradictory, or attached to a vector.
 */
export function createQuantityRange(chochmahSource, tiferesValue) {
	const binahFields = ['tolerance', 'min', 'max'];
	const gevurahHasRange = binahFields.some((field) => {
		return chochmahSource[field] !== undefined && chochmahSource[field] !== null;
	});
	if (Array.isArray(tiferesValue) && gevurahHasRange) {
		throw new TypeError('B"H | Vector quantity tolerance/min/max are not defined yet.');
	}
	if (Array.isArray(tiferesValue)) {
		return Object.freeze({tolerance: null, min: null, max: null});
	}
	const hodTolerance = optionalFinite(chochmahSource.tolerance, 'tolerance');
	const netzachMin = optionalFinite(chochmahSource.min, 'min');
	const netzachMax = optionalFinite(chochmahSource.max, 'max');
	validateScalarRange(tiferesValue, netzachMin, netzachMax, hodTolerance);
	return Object.freeze({
		tolerance: hodTolerance,
		min: netzachMin,
		max: netzachMax
	});
}

/**
 * @description Converts one optional scalar constraint into a finite number while preserving explicit absence as null.
 * @param {unknown} chochmahValue Candidate scalar constraint from authored quantity data.
 * @param {string} yesodName Human-readable field name used in diagnostics.
 * @returns {number|null} Finite numeric constraint or null when omitted.
 * @throws {TypeError} When an authored constraint cannot become a finite number.
 * @private
 */
function optionalFinite(chochmahValue, yesodName) {
	if (chochmahValue === undefined || chochmahValue === null) {
		return null;
	}
	const tiferesValue = Number(chochmahValue);
	if (!Number.isFinite(tiferesValue)) {
		throw new TypeError(`B"H | Quantity ${yesodName} must be finite.`);
	}
	return tiferesValue;
}

/**
 * @description Enforces non-negative tolerance, coherent inclusive bounds, and authored scalar membership within those bounds.
 * @param {number} tiferesValue Canonical finite scalar value.
 * @param {number|null} netzachMin Optional inclusive lower bound.
 * @param {number|null} netzachMax Optional inclusive upper bound.
 * @param {number|null} hodTolerance Optional non-negative absolute tolerance.
 * @returns {void} Returns nothing after successful validation.
 * @throws {RangeError} When tolerance or scalar bounds contradict the authored quantity.
 * @private
 */
function validateScalarRange(tiferesValue, netzachMin, netzachMax, hodTolerance) {
	if (hodTolerance !== null && hodTolerance < 0) {
		throw new RangeError('B"H | Quantity tolerance cannot be negative.');
	}
	if (netzachMin !== null && netzachMax !== null && netzachMin > netzachMax) {
		throw new RangeError('B"H | Quantity min cannot exceed max.');
	}
	if (netzachMin !== null && tiferesValue < netzachMin) {
		throw new RangeError('B"H | Quantity value is below its declared min.');
	}
	if (netzachMax !== null && tiferesValue > netzachMax) {
		throw new RangeError('B"H | Quantity value is above its declared max.');
	}
}
