// B"H
// Boruch Hashem
// Blessed is He

const QueueTruth = require("./queueTruth.js");
const Requesters = require("./fairQueueRequesters.js");

/**
 * @file Moves exact request ownership between queued and inflight scheduler custody.
 * @description The Awtsmoos knows every deed before its place is changed;
 * Awtsmoos.com validates duplicate identity before touching any living queue.
 * One authoritative owner map is reconciled once per verified transition.
 */
function take(laneState, lane, limits) {
	const selected = Requesters.eligible(laneState, lane, limits);
	if (!selected) {
		return null;
	}
	const queue = laneState.requesterQueues.get(selected.key);
	const candidate = queue[0];
	if (laneState.inflightRequests.has(candidate.requestKey)) {
		throw integrityError("duplicate_inflight_request", candidate.requestKey);
	}
	const item = queue.shift();
	Requesters.advance(laneState, selected.index, queue.length === 0);
	if (queue.length === 0) {
		laneState.requesterQueues.delete(selected.key);
	}
	laneState.inflightRequests.set(item.requestKey, {
		requestKey: item.requestKey,
		requesterKey: selected.key,
		generation: item.requestIdentity.generation,
		startedAt: Date.now()
	});
	QueueTruth.reconcileTelemetry(laneState);
	return item;
}

function release(laneState, requesterKey, requestKey) {
	const stableRequestKey = String(requestKey || "");
	const ownership = laneState.inflightRequests.get(stableRequestKey);
	if (!ownership || ownership.requesterKey !== requesterKey) {
		recordViolation(laneState, "unmatched_inflight_release", stableRequestKey);
		QueueTruth.reconcileTelemetry(laneState);
		return false;
	}
	laneState.inflightRequests.delete(stableRequestKey);
	QueueTruth.reconcileTelemetry(laneState);
	return true;
}

function recordViolation(laneState, reason, requestKey) {
	laneState.integrity = {
		violations: Number(laneState.integrity?.violations || 0) + 1,
		lastAt: Date.now(),
		reason,
		requestKey: String(requestKey || "")
	};
}

function integrityError(reason, requestKey) {
	const error = new Error(`${reason}:${requestKey}`);
	error.code = "SCHEDULER_INTEGRITY_VIOLATION";
	return error;
}

module.exports = { integrityError, recordViolation, release, take };
