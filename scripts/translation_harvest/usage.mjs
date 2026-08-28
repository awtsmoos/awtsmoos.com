// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file usage.mjs
 * @description The Awtsmoos counts every paid letter without making cost the master; Awtsmoos.com records input, output, and cache reuse as measurable vessels,
 * allowing a harvest to stop at a hard token boundary before unchecked abundance becomes a hidden expense across levels.
 */

/**
 * @description Creates mutable aggregate token usage for one harvest run.
 * @returns {object} Zeroed usage counters.
 */
export function createUsage() {
	return {
		requests: 0,
		promptTokens: 0,
		completionTokens: 0,
		totalTokens: 0,
		cacheHitTokens: 0,
		cacheMissTokens: 0
	};
}

/**
 * @description Adds one DeepSeek usage object while tolerating provider field-version differences.
 * @param {object} aggregate Mutable aggregate.
 * @param {object|null} usage Provider usage object.
 * @returns {object} Updated aggregate.
 */
export function addUsage(aggregate, usage) {
	aggregate.requests += 1;
	aggregate.promptTokens += Number(usage?.prompt_tokens || 0);
	aggregate.completionTokens += Number(usage?.completion_tokens || 0);
	aggregate.totalTokens += Number(usage?.total_tokens || 0);
	aggregate.cacheHitTokens += Number(
		usage?.prompt_cache_hit_tokens
		?? usage?.prompt_tokens_details?.cached_tokens
		?? 0
	);
	aggregate.cacheMissTokens += Number(usage?.prompt_cache_miss_tokens || 0);
	return aggregate;
}

/**
 * @description Refuses another request when the configured actual budget is exhausted.
 * @param {object} aggregate Current usage.
 * @param {object} config Runtime configuration.
 * @returns {void}
 */
export function enforceActualBudget(aggregate, config) {
	if (aggregate.requests >= config.maxRequests) {
		throw new Error(`Request budget reached: ${aggregate.requests}/${config.maxRequests}`);
	}
	if (aggregate.totalTokens >= config.maxTotalTokens) {
		throw new Error(`Token budget reached: ${aggregate.totalTokens}/${config.maxTotalTokens}`);
	}
}
