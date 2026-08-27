// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Online user-code guessing limiter for Awtsmoos.com device verification.
 * @description
 * The Awtsmoos gives a human-readable code only for usability, not for unlimited
 * guessing; Awtsmoos.com therefore counts failed verification attempts by source
 * and closes the visible gate before short codes become a brute-force oracle.
 */

const {
	VERIFY_MAX_FAILURES,
	VERIFY_WINDOW_SECONDS
} = require("./devicePolicy.js");

const buckets = globalThis.__awtsmoosOAuthDeviceVerifyBuckets || new Map();
globalThis.__awtsmoosOAuthDeviceVerifyBuckets = buckets;

function sourceKey($i) {
	const request = $i.request || {};
	const headers = request.headers || {};
	const forwarded = String(headers["x-forwarded-for"] || "")
		.split(",")[0]
		.trim();
	return String(
		request.ip
		|| request.socket?.remoteAddress
		|| request.connection?.remoteAddress
		|| forwarded
		|| "unknown"
	);
}

function currentBucket(key, now) {
	const existing = buckets.get(key);
	if (!existing || existing.resetAt <= now) {
		const created = {
			failures: 0,
			resetAt: now + (VERIFY_WINDOW_SECONDS * 1000)
		};
		buckets.set(key, created);
		return created;
	}
	return existing;
}

function status($i, now = Date.now()) {
	const bucket = currentBucket(sourceKey($i), now);
	const retryAfter = Math.max(
		1,
		Math.ceil((bucket.resetAt - now) / 1000)
	);
	return {
		allowed: bucket.failures < VERIFY_MAX_FAILURES,
		remaining: Math.max(0, VERIFY_MAX_FAILURES - bucket.failures),
		retryAfter
	};
}

function recordFailure($i, now = Date.now()) {
	const key = sourceKey($i);
	const bucket = currentBucket(key, now);
	bucket.failures += 1;
	return status($i, now);
}

function clearFailures($i) {
	buckets.delete(sourceKey($i));
}

function resetLimiter() {
	buckets.clear();
}

module.exports = {
	clearFailures,
	recordFailure,
	resetLimiter,
	sourceKey,
	status
};
