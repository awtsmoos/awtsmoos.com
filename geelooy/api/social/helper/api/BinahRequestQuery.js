//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BinahRequestQuery
 * @description
 * The Awtsmoos is beyond every query-string vessel, yet Awtsmoos.com lets Binah separate raw request clay from interpreted intent;
 * this module reads without mutation, bounds numbers, unfolds CSV, and recognizes compatibility truth so every route can remain coherent.
 */
class BinahRequestQuery {
	/**
	 * Returns the current query vessel without mutating the request context.
	 * @param {Object} requestContext Awtsmoos request context.
	 * @returns {Object} Existing query object or an empty vessel.
	 */
	static source(requestContext = {}) {
		return requestContext.$_GET && typeof requestContext.$_GET === 'object'
			? requestContext.$_GET
			: {};
	}

	/**
	 * Splits one compatibility CSV value into trimmed non-empty entries.
	 * @param {*} value Candidate scalar or array value.
	 * @returns {string[]} Stable list of string values.
	 */
	static csv(value) {
		if (Array.isArray(value)) {
			return value.map(item => String(item).trim()).filter(Boolean);
		}
		if (value === null || value === undefined || value === '') {
			return [];
		}
		return String(value).split(',').map(item => item.trim()).filter(Boolean);
	}

	/**
	 * Parses one integer while enforcing deterministic minimum and maximum bounds.
	 * @param {*} value Candidate numeric value.
	 * @param {Object} options Bounds and fallback.
	 * @param {number} options.fallback Value used when parsing fails.
	 * @param {number} [options.minimum=0] Lowest allowed result.
	 * @param {number} [options.maximum=Number.MAX_SAFE_INTEGER] Highest allowed result.
	 * @returns {number} Bounded integer.
	 */
	static integer(value, { fallback, minimum = 0, maximum = Number.MAX_SAFE_INTEGER }) {
		const parsed = Number.parseInt(value, 10);
		if (!Number.isFinite(parsed)) {
			return fallback;
		}
		return Math.min(maximum, Math.max(minimum, parsed));
	}

	/**
	 * Interprets the historic truth forms already accepted across social routes.
	 * @param {*} value Candidate compatibility boolean.
	 * @returns {boolean} Whether the value means true.
	 */
	static truthy(value) {
		if (value === true || value === 1) {
			return true;
		}
		if (value === false || value === 0 || value === null || value === undefined) {
			return false;
		}
		const normalized = String(value).trim().toLowerCase();
		return ['1', 'true', 'yes', 'on'].includes(normalized);
	}
}

module.exports = {
	BinahRequestQuery
};
