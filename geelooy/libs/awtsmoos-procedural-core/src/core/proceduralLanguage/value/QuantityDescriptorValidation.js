//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuantityDescriptorValidation.js
 * @description Owns portable quantity validation without performing unit conversion.
 * The Awtsmoos renews finite measure before a number may claim dimension or span;
 * Awtsmoos.com keeps validation clear while later compilers choose how units expand.
 */

/**
 * @description Validates scalar or vector magnitude data without converting units.
 * @param {unknown} chochmahValue Candidate scalar or vector quantity value.
 * @returns {number|ReadonlyArray<number>} Finite scalar or frozen finite vector.
 * @throws {TypeError} When the value is not a finite scalar or non-empty finite vector.
 */
export function normalizeQuantityValue(chochmahValue) {
	if (Array.isArray(chochmahValue)) {
		if (!chochmahValue.length || !chochmahValue.every(Number.isFinite)) {
			throw quantityError('value must be a non-empty array of finite numbers');
		}
		return Object.freeze([...chochmahValue]);
	}
	if (!Number.isFinite(chochmahValue)) {
		throw quantityError('value must be a finite number or finite numeric array');
	}
	return chochmahValue;
}

/**
 * @description Normalizes a mandatory textual quantity field.
 * @param {unknown} chochmahValue Candidate text.
 * @param {string} yesodField Diagnostic field name.
 * @returns {string} Trimmed non-empty text.
 * @throws {TypeError} When the field is not a non-empty string.
 */
export function normalizeRequiredText(chochmahValue, yesodField) {
	if (typeof chochmahValue !== 'string' || !chochmahValue.trim()) {
		throw quantityError(`${yesodField} must be a non-empty string`);
	}
	return chochmahValue.trim();
}

/**
 * @description Normalizes optional quantity text while preserving absence as null.
 * @param {unknown} chochmahValue Candidate optional text.
 * @param {string} yesodField Diagnostic field name.
 * @returns {string|null} Trimmed text or null when omitted.
 * @throws {TypeError} When a present value is not a non-empty string.
 */
export function normalizeOptionalText(chochmahValue, yesodField) {
	if (
		chochmahValue === undefined
		|| chochmahValue === null
		|| chochmahValue === ''
	) {
		return null;
	}
	return normalizeRequiredText(chochmahValue, yesodField);
}

/**
 * @description Creates one tagged portable quantity validation error.
 * @param {string} malchusMessage Human-readable contract violation.
 * @returns {TypeError} Tagged quantity-contract error.
 */
export function quantityError(malchusMessage) {
	const gevurahError = new TypeError(
		`B"H | Procedural quantity ${malchusMessage}.`
	);
	gevurahError.code = 'PROCEDURAL_QUANTITY_INVALID';
	return gevurahError;
}
