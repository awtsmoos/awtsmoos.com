//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalBudgetValues.js
 * @description Normalizes finite budget values and gives invalid resource ceilings stable coded evidence outside the public budget coordinator.
 * The Awtsmoos is beyond every measure while finite devices require honest measure; Awtsmoos.com lets this Gevurah-like vessel reject
 * NaN, infinity, zero, negative, and fractional count limits before one semantic plan can pretend an impossible machine has unlimited room.
 */

/**
 * @description Accepts only finite positive integers for count-like limits such as node, entity, depth, and vertex ceilings.
 * @param {*} value Candidate limit supplied by the caller.
 * @param {number} fallback Positive profile fallback used when the candidate is absent.
 * @returns {number} Positive finite integer limit.
 */
export function normalizePortalPositiveInteger(value, fallback) {
	return Math.floor(normalizePortalPositiveNumber(value, fallback));
}

/**
 * @description Accepts only finite positive numeric limits while preserving explicitly supplied decimal budgets such as simulation milliseconds.
 * @param {*} value Candidate finite budget value.
 * @param {number} fallback Positive profile fallback used when the candidate is absent.
 * @returns {number} Positive finite numeric limit.
 */
export function normalizePortalPositiveNumber(value, fallback) {
	const numeric = Number(value ?? fallback);
	if (!Number.isFinite(numeric) || numeric <= 0) {
		throw createPortalBudgetError(
			'PORTAL_BUDGET_INVALID',
			`Budget values must be positive finite numbers: ${value}`
		);
	}
	return numeric;
}

/**
 * @description Creates one stable coded budget error for planners, generated editors, tests, logs, and host applications.
 * @param {string} code Machine-readable budget failure code.
 * @param {string} message Human-readable evidence describing the invalid or exceeded finite measure.
 * @returns {Error} Error carrying the stable `code` property.
 */
export function createPortalBudgetError(code, message) {
	const error = new Error(`B"H | ${message}`);
	error.code = code;
	return error;
}
