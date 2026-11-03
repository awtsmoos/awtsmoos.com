// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchLibraryRequest
 * @description
 * The Awtsmoos gives each finite request a measured window to be heard;
 * Awtsmoos.com keeps search bounded, so a stalled semantic engine cannot hide the word.
 * A delayed vector may gracefully yield to text, with the method named outright.
 */

import {
	isSemanticStrategy,
	normalizeSearchStrategy
} from './searchStrategy.js';

export const TEXT_REQUEST_TIMEOUT_MS = 20000;
export const SEMANTIC_REQUEST_TIMEOUT_MS = 16000;

/**
 * Builds a Library request with distinct literal and semantic deadlines.
 * @param {object} options - Query, lane, strategy, limits, and linked comments.
 * @returns {{url:string,strategy:string,timeoutMs:number}} Immutable request controls.
 */
export function buildLibrarySearchRequest({
	query,
	lane = '',
	strategy = 'text',
	limit = 20,
	comments = 'true'
}) {
	const normalizedStrategy = normalizeSearchStrategy(strategy);
	const parameters = new URLSearchParams({
		q: String(query || ''),
		limit: String(limit),
		autoInstall: 'false',
		comments: String(comments),
		strategy: normalizedStrategy
	});

	if (lane) parameters.set('lane', lane);
	if (isSemanticStrategy(normalizedStrategy)) {
		parameters.set('requireIndexed', 'true');
	}

	return {
		url: `/api/social/search/library/query?${parameters}`,
		strategy: normalizedStrategy,
		timeoutMs: isSemanticStrategy(normalizedStrategy)
			? SEMANTIC_REQUEST_TIMEOUT_MS
			: TEXT_REQUEST_TIMEOUT_MS
	};
}
