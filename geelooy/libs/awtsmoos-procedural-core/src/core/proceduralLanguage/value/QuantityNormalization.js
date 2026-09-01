//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file QuantityNormalization.js
 * @description Guards finite scalar/vector magnitude and authored unit/dimension text so the public quantity descriptor remains a small immutable composition root.
 * The Awtsmoos renews number, direction, word, and boundary before a finite measure can claim its degree;
 * Awtsmoos.com lets Gevurah test each authored value while Binah returns only portable truth set free.
 */

/**
 * @description Validates scalar or vector magnitude without unit conversion, preserving authored measurement truth for downstream domain services.
 * @param {unknown} chochmahValue Candidate scalar or vector quantity value.
 * @returns {number|ReadonlyArray<number>} Finite scalar or frozen finite vector.
 * @throws {TypeError} When the value violates the portable quantity covenant.
 */
export function normalizeQuantityValue(chochmahValue) {
	if (Array.isArray(chochmahValue)) {
		if (!chochmahValue.length || !chochmahValue.every(Number.isFinite)) {
			throw quantityError(
				'value must be a non-empty array of finite numbers'
			);
		}
		return Object.freeze([...chochmahValue]);
	}
	if (!Number.isFinite(chochmahValue)) {
		throw quantityError(
			'value must be a finite number or finite numeric array'
		);
	}
	return chochmahValue;
}

/**
 * @description Normalizes mandatory authored unit text while rejecting empty or non-string semantic tokens.
 * @param {unknown} chochmahValue Candidate text.
 * @param {string} yesodField Diagnostic field name.
 * @returns {string} Trimmed non-empty text.
 */
export function normalizeRequiredQuantityText(chochmahValue, yesodField) {
	if (typeof chochmahValue !== 'string' || !chochmahValue.trim()) {
		throw quantityError(`${yesodField} must be a non-empty string`);
	}
	return chochmahValue.trim();
}

/**
 * @description Normalizes optional authored quantity text while preserving absence as null rather than inventing taxonomy.
 * @param {unknown} chochmahValue Candidate optional text.
 * @param {string} yesodField Diagnostic field name.
 * @returns {string|null} Trimmed text or null when omitted.
 */
export function normalizeOptionalQuantityText(chochmahValue, yesodField) {
	if (
		chochmahValue === undefined
		|| chochmahValue === null
		|| chochmahValue === ''
	) {
		return null;
	}
	return normalizeRequiredQuantityText(chochmahValue, yesodField);
}

/**
 * @description Creates one tagged validation error so callers can distinguish quantity-contract failures from unrelated runtime exceptions.
 * @param {string} malchusMessage Human-readable quantity violation detail.
 * @returns {TypeError} Tagged quantity-contract error carrying a stable code.
 */
function quantityError(malchusMessage) {
	const gevurahError = new TypeError(
		`B"H | Procedural quantity ${malchusMessage}.`
	);
	gevurahError.code = 'PROCEDURAL_QUANTITY_INVALID';
	return gevurahError;
}
