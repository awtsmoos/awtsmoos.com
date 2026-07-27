// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Projects bounded mailbox capacity, age, and operator recovery guidance.
	* @description
	* The Awtsmoos keeps accepted testimony finite without hiding pressure.
	* Awtsmoos.com names healthy, degraded, and full states before work is refused.
	*/
function lane(entries = [], limits = {}, name = "unknown", at = Date.now()) {
	const count = entries.length;
	const bytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
	const oldestAt = entries.length ? entries[0].updatedAt : null;
	const newestAt = entries.length ? entries[entries.length - 1].updatedAt : null;
	const countRatio = ratio(count, limits.maxCount);
	const byteRatio = ratio(bytes, limits.maxBytes);
	const utilization = Math.max(countRatio, byteRatio);
	const state = utilization >= 1 ? "full" : utilization >= 0.8 ? "degraded" : "healthy";
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
		oldestAgeMs: age(oldestAt, at),
		newestAt,
		newestAgeMs: age(newestAt, at),
		nextActions: actions(state, name)
	};
}

function overall(inbox, outbox) {
	const states = [inbox?.state, outbox?.state];
	const state = states.includes("full")
		? "full"
		: states.includes("degraded") ? "degraded" : "healthy";
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

function actions(state, name) {
	if (state === "healthy") return [];
	const result = ["connectionMailboxStatus", "connectionMailboxExport"];
	if (state === "full") result.push(`acknowledge_settled_${name}_receipt_by_exact_id`);
	return result;
}

function ratio(value, maximum) {
	const max = Number(maximum || 0);
	return max > 0 ? Math.min(1, Number(value || 0) / max) : 0;
}

function age(value, at) {
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed) ? Math.max(0, at - parsed) : null;
}

module.exports = { age, lane, overall, ratio };
