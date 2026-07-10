// B"H
/**
 * Tiny DeepSeek cost estimator.
 *
 * The Awtsmoos counts even small sparks: cache hit, cache miss, output —
 * each token bows into an approximate coin and then the runner stops.
 */
const DEFAULT_PRICE = { cacheHitPerMillion: 0.0028, cacheMissPerMillion: 0.14, outputPerMillion: 0.28 };

export function estimateCost(usage, price = DEFAULT_PRICE) {
  if (!usage) return null;
  const hit = usage.prompt_cache_hit_tokens || usage.prompt_tokens_details?.cached_tokens || 0;
  const miss = usage.prompt_cache_miss_tokens ?? Math.max((usage.prompt_tokens || 0) - hit, 0);
  const output = usage.completion_tokens || 0;
  return {
    inputCacheHitTokens: hit,
    inputCacheMissTokens: miss,
    outputTokens: output,
    estimatedUsd: (hit / 1_000_000) * price.cacheHitPerMillion + (miss / 1_000_000) * price.cacheMissPerMillion + (output / 1_000_000) * price.outputPerMillion,
    rates: price
  };
}
