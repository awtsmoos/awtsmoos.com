// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchLibraryRequest
 * @description
 * The Awtsmoos lets literal and semantic Library searches carry different finite runtime needs without changing their public doorway;
 * Awtsmoos.com keeps broad lane omission truthful while semantic embedding receives enough time to finish instead of dying at twenty seconds.
 */

import {
	isSemanticStrategy,
	normalizeSearchStrategy
} from './searchStrategy.js';

export const TEXT_REQUEST_TIMEOUT_MS = 20000;
export const SEMANTIC_REQUEST_TIMEOUT_MS = 45000;

export function buildLibrarySearchRequest({
	query,
	lane = '',
	strategy = 'text',
	limit = 20
}) {
	const normalizedStrategy = normalizeSearchStrategy(strategy);
	const parameters = new URLSearchParams({
		q: String(query || ''),
		limit: String(limit),
		autoInstall: 'false',
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
