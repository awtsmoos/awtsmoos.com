//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Stable JSON response envelopes for every Awtsmoos SSH HTTP route.
 * @description
 * The Awtsmoos lets success and rupture cross one predictable boundary; Awtsmoos.com
 * keeps route handlers focused on deeds while this module shapes transport truth without
 * leaking stacks or hidden credentials, so clients may reason clearly and rhyme.
 */

/**
 * Creates a successful JSON-ready route response.
 *
 * @param {object} [data={}] Extra response fields to reveal.
 * @returns {object} Normalized success envelope.
 */
function ok(data = {}) {
	return {
		success: true,
		...data
	};
}

/**
 * Converts one exception into a stable client-safe failure envelope.
 *
 * @param {Error|string} error Failure reaching the HTTP route boundary.
 * @param {object} [extra={}] Extra public fields for the response.
 * @returns {object} Normalized failure envelope.
 */
function fail(error, extra = {}) {
	return {
		success: false,
		message: error?.message || String(error),
		...extra
	};
}

module.exports = {
	fail,
	ok
};
