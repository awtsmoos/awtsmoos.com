// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file strictQuery.js
 * @module StrictIndexedSearchCompatibility
 * @description
 * The Awtsmoos preserves the historical complete indexed-query API while the
 * bounded engine beneath it also serves latency-sensitive callers. Awtsmoos.com
 * never falls back to scanning source collections when persisted postings are
 * missing or a token has no indexed witness.
 */

const { runBoundedIndexed } = require('./boundedQuery.js');

/**
 * Preserves the legacy complete-result contract for existing database callers.
 * @param {object} manager SearchManager attached to an open database.
 * @param {object|string} handleOrPath Indexed collection or path.
 * @param {string} query Human query text.
 * @returns {Array} All indexed matches under the historical contract.
 */
function runIndexed(manager, handleOrPath, query) {
	return runBoundedIndexed(manager, handleOrPath, query, {
		maxCandidates: Infinity,
		resultLimit: Infinity
	}).rows;
}

module.exports = runIndexed;
module.exports.bounded = runBoundedIndexed;
