// B"H
// Boruch Hashem
// Blessed is He

const Family = require("./failure-family.js");

/**
 * @file Quarantines only the executor family proven to kill or freeze workers.
 * @description
 * The Awtsmoos renews healthy vessels while one wounded keli rests; Awtsmoos.com
 * remembers a short exact failure streak, never confuses business errors with death,
 * and automatically opens the gate again after a bounded healing interval.
 */
function gate(state, payload, policy, now = Date.now()) {
	const family = Family.familyForPayload(payload);
	const records = recordMap(state);
	const record = records.get(family);
	if (!record) return { ok: true, family };
	if (isStale(record, policy, now)) {
		records.delete(family);
		return { ok: true, family };
	}
	const retryAfterMs = Math.max(0, record.openUntil - now);
	if (!retryAfterMs) return { ok: true, family };
	return {
		ok: false,
		family,
		failures: record.failures,
		lastCode: record.lastCode,
		retryAfterMs
	};
}

/** Records only destructive worker-level failure evidence for one family. */
function recordFailure(state, payload, code, policy, now = Date.now()) {
	const family = Family.familyForPayload(payload);
	const records = recordMap(state);
	const previous = records.get(family);
	const continued = previous && !isStale(previous, policy, now);
	const failures = continued ? previous.failures + 1 : 1;
	const threshold = Number(policy.FAMILY_FAILURE_THRESHOLD || 2);
	const openUntil = failures >= threshold
		? now + Number(policy.FAMILY_FAILURE_COOLDOWN_MS || 5000)
		: 0;
	const record = {
		failures,
		lastCode: String(code || "FS_EXECUTOR_WORKER_FAILURE"),
		lastFailureAt: now,
		openUntil
	};
	records.set(family, record);
	return { family, ...record };
}

/** A terminal worker reply proves this family's current vessel survived the deed. */
function recordHealthy(state, payload) {
	return recordMap(state).delete(Family.familyForPayload(payload));
}

/** Returns bounded non-secret testimony for runtime status and recovery decisions. */
function snapshot(state, policy, now = Date.now()) {
	const records = recordMap(state);
	const families = [];
	for (const [family, record] of records) {
		if (isStale(record, policy, now)) {
			records.delete(family);
			continue;
		}
		families.push({
			family,
			failures: record.failures,
			lastCode: record.lastCode,
			quarantined: record.openUntil > now,
			retryAfterMs: Math.max(0, record.openUntil - now)
		});
	}
	families.sort((first, second) => first.family.localeCompare(second.family));
	return {
		cooldownMs: policy.FAMILY_FAILURE_COOLDOWN_MS,
		failureThreshold: policy.FAMILY_FAILURE_THRESHOLD,
		failureWindowMs: policy.FAMILY_FAILURE_WINDOW_MS,
		quarantinedFamilies: families.filter(item => item.quarantined).length,
		trackedFamilies: families.length,
		families
	};
}

function isStale(record, policy, now) {
	const windowMs = Number(policy.FAMILY_FAILURE_WINDOW_MS || 30000);
	return record.openUntil <= now && now - record.lastFailureAt > windowMs;
}

function recordMap(state) {
	if (!(state.familyFailures instanceof Map)) state.familyFailures = new Map();
	return state.familyFailures;
}

module.exports = {
	gate,
	recordFailure,
	recordHealthy,
	snapshot
};
