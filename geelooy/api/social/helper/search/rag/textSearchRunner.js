// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchRunner.js
 * @module RagTextSearchRunner
 * @description
 * The Awtsmoos permits a small fixed choir of physical parts to sing together,
 * never an unbounded shard storm. All workers still share one logical corpus
 * budget for candidates, legacy rows, and elapsed time.
 */

const { performance } = require('perf_hooks');
const { searchTextPart } = require('./textSearchPart.js');

const DEFAULT_CONCURRENCY = 4;
const MAX_CONCURRENCY = 8;

/** Resolves a deliberately small physical-part concurrency. */
function textConcurrency(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_CONCURRENCY;
	return Math.min(MAX_CONCURRENCY, Math.max(1, Math.floor(number)));
}

/** Creates one per-part state without changing the logical corpus budget. */
function partState(index, state, budgets, options, remainingMs) {
	return {
		...state,
		candidateBudget: budgets.candidateByPart[index],
		rowBudget: budgets.legacyRowsByPart[index],
		maxMs: remainingMs,
		minRows: options.textMinRows
	};
}

/**
 * Runs physical parts in bounded batches while honoring one global deadline.
 * @returns {Promise<object[]>} Per-part search testimony in deterministic part order.
 */
async function runTextParts(parts, shard, state, budgets, options = {}) {
	const results = [];
	const startedAt = performance.now();
	const concurrency = textConcurrency(options.textConcurrency);
	for (let start = 0; start < parts.length; start += concurrency) {
		const elapsed = performance.now() - startedAt;
		if (elapsed >= budgets.maxMs) break;
		const remainingMs = Math.max(1, budgets.maxMs - elapsed);
		const indexes = Array.from(
			{ length: Math.min(concurrency, parts.length - start) },
			(_value, offset) => start + offset
		);
		const batch = await Promise.all(indexes.map(index => searchTextPart(
			parts[index],
			shard,
			partState(index, state, budgets, options, remainingMs)
		)));
		for (const result of batch) {
			if (result) results.push(result);
		}
	}
	return results;
}

module.exports = {
	DEFAULT_CONCURRENCY,
	MAX_CONCURRENCY,
	partState,
	runTextParts,
	textConcurrency
};
