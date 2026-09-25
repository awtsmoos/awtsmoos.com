//B"H // Boruch Hashem // Blessed is He

const Envelope = require("./actionReplayEnvelope.js");
const ResultView = require("./actionResultView.js");

/**
 * @file Interprets durable canonical state without authorizing another deed.
 * @description The Awtsmoos distinguishes reservation, execution, and terminal fruit. Every replay
 * response carries one normalized execution proof, so Awtsmoos.com reveals whether a Shliach should
 * observe the existing request, trust a terminal result, or safely redispatch without duplicate work.
 */
function fromRecord(record, identity) {
	if (!sameOperation(record, identity)) return withProof(conflict(identity, record));
	if (record.state === "completed" && !record.resultOmitted) {
		return withProof(annotate(record.result, "durable", identity));
	}
	if (record.state === "completed") return withProof(omitted(record, identity));
	if (record.state === "failed") return withProof(previousFailure(record, identity));
	return withProof(pending(identity, record));
}

function sameOperation(record, identity) {
	if (!record) return false;
	return identity.retry
		? String(record.action || "") === String(identity.action || "")
		: record.fingerprint === identity.fingerprint;
}

function annotate(result, source, identity = {}) {
	const output = result && typeof result === "object" ? { ...result } : { ok: true, result };
	return {
		...Envelope.identityEnvelope(identity, output),
		...output,
		replayed: true,
		replaySource: source,
		executionCompleted: true,
		terminal: true
	};
}

function omitted(record, identity) {
	return terminalError(identity, "action_result_omitted", {
		status: 409,
		resultSha256: record.resultSha256 || null
	});
}

function previousFailure(record, identity) {
	return terminalError(identity, "previous_action_failed", {
		status: 409,
		previousError: record.error || null
	});
}

function pending(identity, record = {}) {
	return {
		...Envelope.identityEnvelope(identity, { action: "tunnelRequestPending" }),
		ok: false,
		status: 202,
		pending: true,
		terminal: false,
		consumerStarted: Boolean(record.consumerStarted || record.workerId || record.pid),
		error: "canonical_request_pending",
		resumeToken: identity.key,
		retryPayload: Envelope.retryPayload(identity),
		reservedAt: record.startedAt || null,
		message: "The canonical deed is reserved. Observe this request; do not execute it again."
	};
}

function unknown(identity) {
	return withProof(terminalError(identity, "unknown_control_request_id", {
		action: "retryAction",
		status: 404,
		freshRedispatchSafe: true,
		resumeToken: identity.key
	}));
}

function conflict(identity, record = {}) {
	return terminalError(identity, "control_request_id_conflict", {
		status: 409,
		expectedAction: record.action || null,
		expectedFingerprint: record.fingerprint || null,
		actualFingerprint: identity.fingerprint
	});
}

function persistenceFailure(identity, result, error) {
	return withProof(terminalError(identity, "action_result_persistence_failed", {
		...result,
		status: 500,
		message: String(error?.message || error)
	}));
}

function terminalError(identity, error, extras = {}) {
	return {
		...Envelope.identityEnvelope(identity, extras),
		...extras,
		ok: false,
		terminal: true,
		executionCompleted: error !== "unknown_control_request_id",
		error
	};
}

function withProof(result) {
	return { ...result, executionProof: ResultView.executionProof(result) };
}

module.exports = {
	annotate, conflict, fromRecord,
	identityEnvelope: Envelope.identityEnvelope,
	pending, persistenceFailure,
	retryPayload: Envelope.retryPayload,
	sameOperation, uncertain: pending,
	unknown, withProof
};
