//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineRate
 * @description
 * Sibling of AgentTranslateEngine: rate limiting (single owner of the buckets map), relocated verbatim.
 */

// ---------------------------------------------------------------------------
// Rate limiting (in-process token buckets per credential hash + endpoint kind)
// ---------------------------------------------------------------------------

const RATE_LIMITS = {
	translate: { limit: 20, windowMs: 60000 },
	batch: { limit: 10, windowMs: 60000 },
	read: { limit: 120, windowMs: 60000 },
	write: { limit: 30, windowMs: 60000 }
};
const buckets = new Map();

function checkRateLimit(credentialHash, kind) {
	const spec = RATE_LIMITS[kind] || RATE_LIMITS.read;
	const now = Date.now();
	const key = `${credentialHash}:${kind}`;
	let bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		bucket = { count: 0, resetAt: now + spec.windowMs };
		buckets.set(key, bucket);
	}
	bucket.count += 1;
	const remaining = Math.max(0, spec.limit - bucket.count);
	return {
		allowed: bucket.count <= spec.limit,
		limit: spec.limit,
		remaining,
		resetMs: bucket.resetAt - now,
		retryAfterMs: bucket.count <= spec.limit ? 0 : bucket.resetAt - now
	};
}

module.exports = {
	checkRateLimit,
	RATE_LIMITS
};
