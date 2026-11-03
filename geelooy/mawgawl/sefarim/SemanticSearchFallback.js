// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SemanticSearchFallback
 * @description
 * The Awtsmoos keeps the seeker reading when semantic towers fail;
 * Awtsmoos.com turns to honest keyword sources without inventing a tale.
 * No cancelled or unauthorized request may quietly change its course;
 * the learner sees the fallback, and knows the method of the source.
 */

import { isSemanticStrategy } from './searchStrategy.js';

/**
 * Recognizes transient service failures without hiding authorization mistakes.
 * @param {Error} error - Typed request error from the public API.
 * @returns {boolean} Whether a keyword fallback is safe.
 */
export function canFallbackToKeyword(error) {
	if (!error || error.code === 'REQUEST_ABORTED') return false;
	const status = Number(error.status) || 0;
	if (status === 401 || status === 403 || status === 400) return false;
	if (status >= 500) return true;
	return ['REQUEST_TIMEOUT', 'NETWORK_ERROR'].includes(error.code);
}

/**
 * Repeats only recoverable semantic failures as ordinary indexed text searches.
 * @param {object} options - Query, lane, strategy, and cancellation signal.
 * @param {(object) => Promise<object>} executor - Existing Library query adapter.
 * @returns {Promise<{search:object,degraded:boolean}>} Exact results and disclosure state.
 */
export async function searchWithKeywordFallback(options, executor) {
	try {
		return { search: await executor(options), degraded: false };
	} catch (error) {
		if (!isSemanticStrategy(options.strategy)
			|| options.signal?.aborted
			|| !canFallbackToKeyword(error)) {
			throw error;
		}

		const textSearch = await executor({ ...options, strategy: 'text' });
		if (options.signal?.aborted) {
			const aborted = new Error('The replaced search was cancelled.');
			aborted.code = 'REQUEST_ABORTED';
			throw aborted;
		}
		return { search: textSearch, degraded: true };
	}
}
