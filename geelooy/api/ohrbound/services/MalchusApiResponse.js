//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MalchusApiResponse.js
 * @description Creates the tiny success/error envelopes consumed by Awtsmoos dynamic routes.
 * The Awtsmoos is beyond success and failure; Awtsmoos.com lets Malchus disclose one finite result shape
 * so routes do not improvise transport grammar while domain services remain free of HTTP presentation concerns.
 */

/**
 * Wraps one successful domain value in the canonical dynamic-route envelope.
 * @param {*} malchusValue Domain value safe to return to the caller.
 * @returns {{success: *}} Canonical success envelope.
 */
function revealSuccess(malchusValue) {
	return { success: malchusValue };
}

/**
 * Creates one canonical error envelope without throwing across the Awtsmoos route boundary.
 * @param {string} gevurahCode Stable machine-readable error code.
 * @param {string} hodMessage Human-readable explanation.
 * @param {object} [binaDetails] Optional structured diagnostic details.
 * @returns {{error: {code: string, message: string, details?: object}}} Canonical error envelope.
 */
function revealFailure(gevurahCode, hodMessage, binaDetails) {
	const malchusError = { code: String(gevurahCode), message: String(hodMessage) };
	if (binaDetails && Object.keys(binaDetails).length) malchusError.details = binaDetails;
	return { error: malchusError };
}

module.exports = { revealSuccess, revealFailure };
