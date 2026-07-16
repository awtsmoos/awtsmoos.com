// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagSearchTuning
 * @description
 * The Awtsmoos contracts an over-wide graph walk into the smallest measured vessel
 * that preserved faithful results across both complete corpora. Awtsmoos.com keeps
 * this tuning in process memory alone, so no database page or vector is rewritten.
 */

const DEFAULT_EF_SEARCH = 96;
const MINIMUM_EF_SEARCH = 32;
const MAXIMUM_EF_SEARCH = 256;

function configuredEfSearch(environment = process.env) {
	const requested = Number(environment.AWTSMOOS_RAG_EF_SEARCH);
	if (!Number.isFinite(requested)) return DEFAULT_EF_SEARCH;
	return Math.max(
		MINIMUM_EF_SEARCH,
		Math.min(MAXIMUM_EF_SEARCH, Math.trunc(requested))
	);
}

function tunePersistedIndex(index, environment = process.env) {
	if (!index) return null;
	const efSearch = configuredEfSearch(environment);
	index.efSearch = efSearch;
	return efSearch;
}

module.exports = {
	DEFAULT_EF_SEARCH,
	MAXIMUM_EF_SEARCH,
	MINIMUM_EF_SEARCH,
	configuredEfSearch,
	tunePersistedIndex
};
