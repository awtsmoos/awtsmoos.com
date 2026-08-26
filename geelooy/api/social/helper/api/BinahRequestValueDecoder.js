//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BinahRequestValueDecoder
 * @description
 * The Awtsmoos creates raw letters and structured meaning in one instant, while code must still distinguish their vessels;
 * Awtsmoos.com lets Binah decode legacy JSON strings, merged request fields, and number-like values without smuggling domain behavior into transport.
 *
 * RESPONSIBILITY:
 * Decode compatibility-oriented request values.
 *
 * NON-RESPONSIBILITY:
 * This module does not validate domain semantics, authorize callers, persist data, or choose routes.
 */
class BinahRequestValueDecoder {
	/**
	 * Decodes a JSON-compatible value while preserving already-decoded objects.
	 *
	 * @param {*} value
	 * 	A raw request value, already-decoded value, or empty input.
	 * @param {*} [fallback={}]
	 * 	Value returned when input is absent or malformed.
	 * @returns {*}
	 * 	The decoded value, original object, or fallback.
	 */
	json(value, fallback = {}) {
		if (!value) {
			return fallback;
		}

		if (typeof value === 'object') {
			return value;
		}

		try {
			return JSON.parse(value);
		} catch {
			return fallback;
		}
	}

	/**
	 * Merges query fields beneath body fields, matching the observed civilization compatibility contract.
	 *
	 * @param {Object} [query={}]
	 * 	Query-string-derived values.
	 * @param {Object} [body={}]
	 * 	POST/body-derived values, which take precedence.
	 * @returns {Object}
	 * 	A new merged request value object.
	 */
	merge(query = {}, body = {}) {
		return {
			...query,
			...body
		};
	}

	/**
	 * Converts the first truthy supplied value to Number while retaining the historic fallback behavior.
	 *
	 * @param {*} value
	 * 	The candidate numeric request value.
	 * @param {*} fallback
	 * 	Value used when the candidate is falsey.
	 * @returns {number}
	 * 	The Number conversion of `value || fallback`.
	 */
	number(value, fallback) {
		return Number(value || fallback);
	}
}

module.exports = {
	BinahRequestValueDecoder
};
