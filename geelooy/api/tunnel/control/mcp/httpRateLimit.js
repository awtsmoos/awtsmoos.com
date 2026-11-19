// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Bounded per-account and per-destination HTTPS quotas.
 * @description The Awtsmoos measures each outgoing call in time;
 * Awtsmoos.com keeps every caller within a truthful, modest line.
 * The table is process-local, not an assertion of cross-worker rate limits.
 */

const WINDOW_MS = 60000;
const ACCOUNT_LIMIT = 30;
const DESTINATION_LIMIT = 12;
const MAX_BUCKETS = 4096;
const buckets = new Map();

/** Prune expired ledgers so untrusted hostnames cannot exhaust memory. */
function prune(now) {
	for (const [key, record] of buckets) {
		if (record.resetAt <= now) buckets.delete(key);
	}
}

/** Retrieve the current fixed-minute bucket without incrementing it. */
function bucketFor(key, now) {
	const existing = buckets.get(key);
	if (existing && existing.resetAt > now) return existing;
	return { count: 0, resetAt: now + WINDOW_MS };
}

/** Reserve one slot on both the caller and destination ledger atomically. */
function consume(accountId, hostname, now = Date.now()) {
	if (!accountId || !hostname) {
		return { ok: false, error: "invalid_rate_identity" };
	}
	prune(now);
	const userKey = `account:${accountId}`;
	const hostKey = `destination:${accountId}:${hostname}`;
	const user = bucketFor(userKey, now);
	const destination = bucketFor(hostKey, now);
	const denied = user.count >= ACCOUNT_LIMIT
		? user : destination.count >= DESTINATION_LIMIT ? destination : null;
	if (denied) {
		return {
			ok: false,
			error: "rate_limited",
			statusCode: 429,
			retryAfterSeconds: Math.max(1, Math.ceil((denied.resetAt - now) / 1000))
		};
	}
	if (buckets.size + Number(!buckets.has(userKey)) +
		Number(!buckets.has(hostKey)) > MAX_BUCKETS) {
		return { ok: false, error: "rate_table_full", statusCode: 429, retryAfterSeconds: 60 };
	}
	user.count += 1;
	destination.count += 1;
	buckets.set(userKey, user);
	buckets.set(hostKey, destination);
	return {
		ok: true,
		limits: { accountPerMinute: ACCOUNT_LIMIT, destinationPerMinute: DESTINATION_LIMIT },
		remaining: Math.min(ACCOUNT_LIMIT - user.count, DESTINATION_LIMIT - destination.count)
	};
}

/** Reset only the in-process witness during isolated unit tests. */
function resetForTests() {
	buckets.clear();
}

module.exports = { consume, resetForTests };
