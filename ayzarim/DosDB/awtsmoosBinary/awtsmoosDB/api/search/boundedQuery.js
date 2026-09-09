// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file boundedQuery.js
 * @module BoundedIndexedSearch
 * @description
 * The Awtsmoos answers only from persisted token postings and carries a fixed
 * candidate vessel through strict intersection or broad lexical union.
 * Awtsmoos.com exposes truncation truth so callers may choose latency and
 * completeness without turning a frequent word into whole-corpus process memory.
 */

const constants = require('../../constants.js');
const tokenizer = require('./indexer/tokenizer.js');
const {
	boundedPointers,
	boundedUnion,
	descriptor
} = require('./postingReader.js');

const DEFAULT_MAX_CANDIDATES = 2048;

/** Resolves a stable indexed path from a string or live collection handle. */
function resolvePath(handleOrPath) {
	if (typeof handleOrPath === 'string') return handleOrPath;
	const soul = handleOrPath?.[constants.SYMBOLS.INTERNALS] || handleOrPath;
	return soul?.getPath?.() || '';
}

/** Creates one explicit strict-index failure without corpus-scan fallback. */
function searchError(message) {
	const error = new Error(`B"H indexed search error: ${message}`);
	error.code = 'AWTSMOOS_DB_SEARCH_INDEX_INVALID';
	return error;
}

/** Normalizes a positive finite cap while allowing Infinity for legacy callers. */
function candidateLimit(value) {
	if (value === Infinity) return Infinity;
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_MAX_CANDIDATES;
	return Math.max(1, Math.floor(number));
}

/** Chooses strict intersection or broad lexical union explicitly. */
function selectCandidates(manager, postings, maximum, match) {
	return match === 'any'
		? boundedUnion(manager, postings, maximum)
		: boundedPointers(manager, postings, maximum);
}

/**
 * Executes a bounded query against persisted postings only.
 * @param {object} manager SearchManager bound to an open AwtsmoosDB.
 * @param {object|string} handleOrPath Indexed collection or canonical path.
 * @param {string} query Human query text.
 * @param {{maxCandidates?:number,resultLimit?:number,match?:'all'|'any'}} options Query policy.
 * @returns {object} Bounded rows and explicit candidate/truncation testimony.
 */
function runBoundedIndexed(manager, handleOrPath, query, options = {}) {
	manager.db.waitForIdle();
	const path = resolvePath(handleOrPath);
	if (!manager.isIndexed(path)) throw searchError(`path is not indexed: ${path}`);
	const tokens = [...tokenizer.tokenize(query)];
	if (!tokens.length) return emptyResult(tokens);
	const indexMap = manager.db.root.__sys_search__?.[path];
	if (!indexMap) throw searchError(`persisted index map is missing: ${path}`);
	const postings = tokens
		.map(token => descriptor(manager, indexMap, token))
		.filter(Boolean);
	if (!postings.length) return emptyResult(tokens);
	if (options.match !== 'any' && postings.length !== tokens.length) {
		return emptyResult(tokens);
	}
	const maximum = candidateLimit(options.maxCandidates);
	const selected = selectCandidates(
		manager,
		postings,
		maximum,
		options.match
	);
	const resultLimit = options.resultLimit === Infinity
		? Infinity
		: Math.max(1, Math.floor(Number(options.resultLimit) || maximum));
	const pointers = selected.pointers.slice(0, resultLimit);
	return {
		rows: pointers.map(pointer => manager._resolveForIndex(pointer)),
		truncated: selected.truncated || selected.pointers.length > resultLimit,
		candidateCount: selected.pointers.length,
		seedPostingCount: selected.seedLength,
		tokens
	};
}

function emptyResult(tokens) {
	return {
		rows: [],
		truncated: false,
		candidateCount: 0,
		seedPostingCount: 0,
		tokens
	};
}

module.exports = {
	DEFAULT_MAX_CANDIDATES,
	candidateLimit,
	runBoundedIndexed
};
