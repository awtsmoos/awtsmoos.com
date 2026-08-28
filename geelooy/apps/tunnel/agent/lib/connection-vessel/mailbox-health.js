// B"H
// Boruch Hashem
// Blessed is He

const Debt = require("./mailbox-acknowledgement-debt.js");
const Policy = require("./mailbox-health-policy.js");

/**
 * @file Projects mailbox records into capacity, age, and acknowledgement-debt health.
 * @description
 * The Awtsmoos preserves each accepted deed while revealing whether it still flows.
 * Awtsmoos.com keeps raw age testimony visible, yet refuses to call living execution
 * dead merely because one completed result still awaits the relay's exact ACK.
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
	const capacityState = Policy.capacityState(utilization);
	const ageState = Policy.ageState(count, oldestAgeMs, thresholds);
	const state = Policy.strongestState([capacityState, ageState]);
	return {
		lane: name,
		state,
		capacityState,
		ageState,
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

/**
 * Combines lane truth while demoting pure preserved terminal ACK debt to degradation.
 * @param {object} inbox Inbox lane health plus parent-custody projection.
 * @param {object} outbox Outbox lane health containing terminal response testimony.
 * @returns {object} Effective and raw mailbox health with explicit debt testimony.
 */
function overall(inbox = {}, outbox = {}) {
	const rawState = Policy.strongestState([inbox.state, outbox.state]);
	const acknowledgementDebt = Debt.describe(outbox);
	const debtOnly = Debt.mayDemote(inbox, outbox);
	const state = debtOnly ? "degraded" : rawState;
	return {
		state,
		rawState,
		reason: debtOnly ? Debt.DEBT_STATE : "",
		healthy: state === "healthy",
		backpressure: rawState === "full",
		acknowledgementDebt,
		nextActions: nextActions(state, acknowledgementDebt)
	};
}

/** Returns recovery actions without suggesting unsafe outbox deletion. */
function nextActions(state, acknowledgementDebt) {
	if (state === "healthy") return [];
	if (acknowledgementDebt?.active) return acknowledgementDebt.nextActions;
	return [
		"connectionMailboxStatus",
		"connectionMailboxExport",
		"connectionMailboxQuarantine"
	];
}

module.exports = {
	...Policy,
	lane,
	nextActions,
	overall
};
