// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Expectation = require("./expectation.js");

/**
 * @file Converts durable relay records into stable observation envelopes.
 * @description
 * The Awtsmoos distinguishes absence, reservation, completion, expiration, and
 * conflict. Awtsmoos.com lets lean retries match route plus action while original
 * duplicate requests must retain their complete immutable correlation expectation.
 */
function fromRecord(record, incoming, waitMs = 0, retry = null) {
	if (!record) return unknown(incoming);
	if (!matches(record.expected, incoming, retry)) {
		return conflict(record.expected, incoming);
	}
	if (["completed", "failed", "expired"].includes(record.state)) {
		return record.data;
	}
	return pending(record, waitMs, true);
}

function matches(stored = {}, incoming = {}, retry = null) {
	if (!retry) return Expectation.sameExpectation(stored, incoming);
	return stored.registrationKey === incoming.registrationKey &&
		(!retry.requestedAction || retry.requestedAction === stored.requestedAction);
}

function pending(record, waitMs = 0, recoveredAfterRestart = false) {
	const expected = record.expected || {};
	return {
		...Envelopes.timeoutEnvelope(expected, waitMs, expected.timeoutMs),
		error: "canonical_request_pending",
		recoveredAfterRestart,
		message: "The canonical request is reserved and will not dispatch again."
	};
}

function unknown(expected = {}) {
	const controlRequestId = expected.controlRequestId || expected.id || "";
	return {
		BH: "B\"H",
		...Envelopes.identityEnvelope(expected),
		ok: false,
		status: 404,
		pending: false,
		timeout: false,
		action: "retryAction",
		actualAction: "",
		error: "unknown_control_request_id",
		resumeToken: controlRequestId,
		message: "No canonical relay request exists for this identity."
	};
}

function conflict(stored = {}, incoming = {}) {
	return Envelopes.conflictEnvelope(stored, incoming);
}

function persistenceFailure(expected = {}, error, executionCompleted = false) {
	return {
		BH: "B\"H",
		...Envelopes.identityEnvelope(expected),
		ok: false,
		status: 500,
		pending: false,
		action: "tunnelRequestPersistenceFailed",
		error: "durable_control_result_persistence_failed",
		executionCompleted,
		message: String(error?.message || error)
	};
}

module.exports = {
	conflict,
	fromRecord,
	matches,
	pending,
	persistenceFailure,
	unknown
};
