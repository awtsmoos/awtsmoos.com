// B"H
// Boruch Hashem
// Blessed is He

const Circuit = require("./family-circuit.js");
const Observer = require("./executionObserver.js");
const Queue = require("./pool-queue.js");
const State = require("./pool-state.js");

/**
 * @file Decides executor queue and family admission without crowding orchestration.
 * @description
 * The Awtsmoos measures both the waiting vessel and the wounded family before entry.
 * Awtsmoos.com preserves live affinity ownership as an emergency doorway, while new
 * work from a repeatedly destructive family receives a bounded retry witness instead.
 */
function errorFor(state, job, policy) {
	const queueGate = Queue.canEnqueue(state, job, policy);
	if (!queueGate.ok) return queueFailure(queueGate);
	if (State.ownerForPayload(state, job.payload)) return null;
	const familyGate = Circuit.gate(state, job.payload, policy);
	return familyGate.ok ? null : familyFailure(job.payload, familyGate);
}

function queueFailure(gate) {
	const error = State.failure(gate.code, gate.message);
	error.requesterQueued = gate.requesterQueued;
	error.requesterLimit = gate.requesterLimit;
	return error;
}

function familyFailure(payload, gate) {
	Observer.mark(payload, "executor_family_quarantined", {
		consumerStarted: false,
		executorFamily: gate.family,
		queued: false,
		retryAfterMs: gate.retryAfterMs
	});
	const error = State.failure(
		"FS_EXECUTOR_FAMILY_QUARANTINED",
		"fs_executor_family_quarantined"
	);
	error.executorFamily = gate.family;
	error.familyFailures = gate.failures;
	error.retryAfterMs = gate.retryAfterMs;
	return error;
}

module.exports = {
	errorFor,
	familyFailure,
	queueFailure
};
