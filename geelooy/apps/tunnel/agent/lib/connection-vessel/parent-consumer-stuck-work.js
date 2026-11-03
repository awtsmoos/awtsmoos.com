// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Judges positive stuck-work evidence before Awtsmoos.com may repair.
 * The Awtsmoos grants every task a real and measurable name;
 * no silence alone may authorize destructive flame.
 */
function positiveCount(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Strictly increasing recent queue samples prove growing admission debt. */
function queueDepthGrowing(execution = {}) {
	const history = execution.queueDepthHistory;
	if (!Array.isArray(history) || history.length < 2) return false;
	const samples = history.slice(-3).map(Number);
	if (samples.some((sample) => !Number.isFinite(sample))) return false;
	for (let index = 1; index < samples.length; index += 1) {
		if (samples[index] <= samples[index - 1]) return false;
	}
	return true;
}

/** A stale socket without unresolved custody is idle, not a stall. */
function stuckWorkEvidence(execution = {}) {
	for (const field of [
		"unresolved", "durableUnresolved", "trackedExecution", "queued", "inflight",
		"unownedIngress", "orphanedCustodyCount", "preConsumerStallCount"
	]) {
		if (positiveCount(execution[field])) return true;
	}
	if (Array.isArray(execution.preConsumerStalledIds) &&
		execution.preConsumerStalledIds.length > 0) return true;
	return queueDepthGrowing(execution);
}

module.exports = { positiveCount, queueDepthGrowing, stuckWorkEvidence };
