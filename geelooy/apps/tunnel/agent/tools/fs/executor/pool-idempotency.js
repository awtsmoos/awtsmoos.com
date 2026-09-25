// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

const State = require("./pool-state.js");

/**
 * @file Deduplicates concurrent and repeated filesystem submissions by idempotency key.
 * @description
 * The Awtsmoos does not perform the same deed twice because two messengers asked.
 * Awtsmoos.com accepts payload.idempotencyKey, or derives a key from the control
 * request id plus a stable hash of the payload. Concurrent duplicates attach to
 * the in-flight job instead of executing twice; terminal results (including
 * errors and cancellations) are cached for a bounded TTL so a retried submission
 * observes the same outcome instead of re-executing. The cache is bounded by
 * entry count with oldest-first eviction plus TTL expiry, so it cannot grow
 * without limit.
 */
function keyFor(payload = {}, metadata = {}) {
	const explicit = payload ? payload.idempotencyKey : undefined;
	if (typeof explicit === "string" && explicit.trim()) {
		return `explicit:${explicit.trim().slice(0, 256)}`;
	}
	const requestId = (metadata && metadata.requestId) || (payload && payload.controlRequestId);
	if (!requestId) return null;
	let fingerprint;
	try {
		fingerprint = crypto
			.createHash("sha256")
			.update(stableStringify(payload || {}))
			.digest("hex")
			.slice(0, 32);
	} catch {
		return null;
	}
	return `request:${String(requestId).slice(0, 128)}:${fingerprint}`;
}

/** Deterministic serialization so equal payloads hash equally. */
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	const keys = Object.keys(value).sort();
	return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function cacheOf(state) {
	if (!(state.idempotency instanceof Map)) state.idempotency = new Map();
	return state.idempotency;
}

function ttlMs(policy) {
	return Math.max(1000, Number(policy.IDEMPOTENCY_TTL_MS) || 60000);
}

function maxSize(policy) {
	return Math.max(64, Number(policy.IDEMPOTENCY_CACHE_SIZE) || 1024);
}

function sweepExpired(map) {
	const now = Date.now();
	for (const [key, entry] of map) {
		if (now > entry.expiresAt) map.delete(key);
	}
}

/**
 * Returns the live cache entry for a key, or null on miss/expiry.
 * Entry shapes: { status: "inflight", waiters, jobId, expiresAt } or
 * { status: "done", ok, result, error:{code,message,stack}, expiresAt }.
 */
function lookup(state, policy, key) {
	if (!key) return null;
	const map = cacheOf(state);
	const entry = map.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		map.delete(key);
		return null;
	}
	return entry;
}

/** Registers a new in-flight entry; evicts oldest-first when over the bound. */
function trackInflight(state, policy, key, job) {
	if (!key) return null;
	const map = cacheOf(state);
	sweepExpired(map);
	const limit = maxSize(policy);
	while (map.size >= limit) {
		const oldest = map.keys().next().value;
		if (oldest === undefined) break;
		map.delete(oldest);
	}
	const entry = {
		status: "inflight",
		waiters: [],
		jobId: (job && job.id) || null,
		expiresAt: Date.now() + ttlMs(policy)
	};
	map.set(key, entry);
	return entry;
}

/**
 * Settles an in-flight entry to its terminal outcome and wakes every attached
 * duplicate with the same result or a restored error. No entry → no-op, so
 * jobs that never entered the cache (no key, admission rejected) settle freely.
 */
function settle(state, policy, key, ok, result, error) {
	if (!key) return;
	const map = cacheOf(state);
	const entry = map.get(key);
	if (!entry || entry.status !== "inflight") return;
	entry.status = "done";
	entry.ok = Boolean(ok);
	if (entry.ok) {
		entry.result = result;
	} else {
		entry.error = {
			code: (error && error.code) || "FS_EXECUTOR_FAILED",
			message: (error && error.message) || String(error || "fs_executor_failed"),
			stack: error && error.stack
		};
	}
	entry.expiresAt = Date.now() + ttlMs(policy);
	const waiters = entry.waiters.splice(0);
	for (const waiter of waiters) {
		try {
			if (entry.ok) waiter.resolve(entry.result);
			else waiter.reject(State.failure(entry.error.code, entry.error.message, entry.error.stack));
		} catch {
			// A waiter that throws during settle must not break the others.
		}
	}
}

module.exports = {
	keyFor,
	lookup,
	settle,
	stableStringify,
	trackInflight
};
