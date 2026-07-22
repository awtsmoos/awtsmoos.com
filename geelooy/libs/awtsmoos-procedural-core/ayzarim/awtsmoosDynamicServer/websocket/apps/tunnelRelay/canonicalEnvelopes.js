// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Expectation = require("./expectation.js");

/**
 * @file Converts durable canonical relay records into stable caller envelopes.
 * @description
 * The Awtsmoos distinguishes unknown, pending, expired, completed, and conflicting
 * deeds. Awtsmoos.com never turns absence into dispatch and never lets a reused
 * identity silently change its authorized action, account route, path, or command.
 */
function fromRecord(record, incoming, waitMs = 0) {
	if (!record) return unknown(incoming);
	if (!Expectation.sameExpectation(record.expected, incoming)) {
		return Envelopes.conflictEnvelope(record.expected, incoming);
	}
	if (["completed", "failed", "expired"].includes(record.state)) {
		return record.data;
	}
	return pending(record, waitMs);
}

function pending(record, waitMs = 0) {
	const expected = record.expected || {};
	return {
		...Envelopes.timeoutEnvelope(
			expected,
			waitMs,
			expected.timeoutMs
		),
		error: "canonical_request_pending",
		recoveredAfterRestart: true,
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

function persistenceFailure(expected = {}, error, executionCompleted = false) {
	return {
		BH: "B\"H",
		...Envelopes.identityEnvelope(expected),
		ok: false,
		status: 500,
		pending: false,
		timeout: false,
		action: "tunnelRequestPersistenceFailed",
		error: "durable_control_result_persistence_failed",
		executionCompleted,
		message: String(error?.message || error)
	};
}

module.exports = {
	fromRecord,
	pending,
	persistenceFailure,
	unknown
};
