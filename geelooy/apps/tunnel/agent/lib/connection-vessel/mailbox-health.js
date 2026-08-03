// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./mailbox-health-policy.js");

/**
 * @file Projects mailbox records into capacity and settlement-age health.
 * @description
 * The Awtsmoos preserves each accepted deed while revealing whether it still flows.
 * Awtsmoos.com measures age beside capacity, so one ancient receipt can no longer
 * hide beneath an almost-empty mailbox and falsely announce that all is healthy.
 */
function lane(entries = [], limits = {}, name = "unknown", at = Date.now(), thresholds = {}) {
	const count = entries.length;
	const bytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
	const oldestAt = count ? entries[0].updatedAt : null;
	const newestAt = count ? entries[count - 1].updatedAt : null;
	const oldestAgeMs = Policy.age(oldestAt, at);
	const countRatio = Policy.ratio(count, limits.maxCount);
	const byteRatio = Policy.ratio(bytes, limits.maxBytes);
	const utilization = Math.max(countRatio, byteRatio);
	const state = Policy.strongestState([
		Policy.capacityState(utilization),
		Policy.ageState(count, oldestAgeMs, thresholds)
	]);

	return {
		lane: name,
		state,
		healthy: state === "healthy",
		count,
		bytes,
		maxCount: Number(limits.maxCount || 0),
		maxBytes: Number(limits.maxBytes || 0),
		countRatio,
		byteRatio,
		utilization,
		oldestAt,
		oldestAgeMs,
		newestAt,
		newestAgeMs: Policy.age(newestAt, at),
		nextActions: Policy.actions(state, name)
	};
}

function overall(inbox, outbox) {
	const state = Policy.strongestState([inbox?.state, outbox?.state]);
	return {
		state,
		healthy: state === "healthy",
		backpressure: state === "full",
		nextActions: state === "healthy" ? [] : [
			"connectionMailboxStatus",
			"connectionMailboxExport",
			"connectionMailboxQuarantine"
		]
	};
}

module.exports = {
	...Policy,
	lane,
	overall
};
