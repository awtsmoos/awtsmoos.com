// B"H
// Boruch Hashem
// Blessed is He
const Envelope = require("./actionReplayEnvelope.js");
/**
 * @file Interprets durable canonical state without authorizing another deed.
 * @description The Awtsmoos distinguishes completion, reservation, conflict,
 * failure, and absence. Awtsmoos.com replays truth without duplicate mutation.
 */
function fromRecord(record, identity) {
	if (!sameOperation(record, identity)) return conflict(identity, record);
	if (record.state === "completed" && !record.resultOmitted) {
		return annotate(record.result, "durable", identity);
	}
	if (record.state === "completed") return omitted(record, identity);
	if (record.state === "failed") return previousFailure(record, identity);
	return pending(identity, record);
}

function sameOperation(record, identity) {
	if (!record) return false;
	return identity.retry
		? String(record.action || "") === String(identity.action || "")
		: record.fingerprint === identity.fingerprint;
}

function annotate(result, source, identity = {}) {
	const output = result && typeof result === "object"
		? { ...result }
		: { ok: true, result };
	return {
		...Envelope.identityEnvelope(identity, output),
		...output,
		replayed: true,
		replaySource: source
	};
}

function omitted(record, identity) {
	return {
		...Envelope.identityEnvelope(identity),
		ok: false,
		status: 409,
		error: "action_result_omitted",
		executionCompleted: true,
		resultSha256: record.resultSha256 || null
	};
}

function previousFailure(record, identity) {
	return {
		...Envelope.identityEnvelope(identity),
		ok: false,
		status: 409,
		error: "previous_action_failed",
		previousError: record.error || null
	};
}

function pending(identity, record = {}) {
	return {
		...Envelope.identityEnvelope(identity, { action: "tunnelRequestPending" }),
		ok: false,
		status: 202,
		pending: true,
		timeout: false,
		error: "canonical_request_pending",
		resumeToken: identity.key,
		retryPayload: Envelope.retryPayload(identity),
		reservedAt: record.startedAt || null,
		message: "The canonical deed is reserved and will not execute again."
	};
}

function unknown(identity) {
	return {
		...Envelope.identityEnvelope(identity, { action: "retryAction" }),
		ok: false,
		status: 404,
		pending: false,
		error: "unknown_control_request_id",
		resumeToken: identity.key
	};
}

function conflict(identity, record = {}) {
	return {
		...Envelope.identityEnvelope(identity),
		ok: false,
		status: 409,
		error: "control_request_id_conflict",
		expectedAction: record?.action || null,
		expectedFingerprint: record?.fingerprint || null,
		actualFingerprint: identity.fingerprint
	};
}

function persistenceFailure(identity, result, error) {
	return {
		...Envelope.identityEnvelope(identity, result),
		ok: false,
		status: 500,
		error: "action_result_persistence_failed",
		executionCompleted: true,
		message: String(error?.message || error)
	};
}

module.exports = {
	annotate,
	conflict,
	fromRecord,
	identityEnvelope: Envelope.identityEnvelope,
	pending,
	persistenceFailure,
	retryPayload: Envelope.retryPayload,
	sameOperation,
	uncertain: pending,
	unknown
};
