//B"H
//Boruch Hashem
//Blessed be He

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

/**
	* Builds one finite Library-search URL and chooses a timeout appropriate to ranking mode.
	* @param {object} options Query controls, result limit, lane, and linked-comment policy.
	* @returns {{url:string,strategy:string,timeoutMs:number}} Immutable request description.
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
