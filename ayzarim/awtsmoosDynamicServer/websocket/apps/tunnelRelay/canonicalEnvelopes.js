// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Expectation = require("./expectation.js");
const Result = require("./durableRecordResult.js");

/**
 * @file Converts durable relay records into stable effective observation envelopes.
 * @description
 * The Awtsmoos distinguishes absence, phase, transport timeout, and manifested deed.
 * Awtsmoos.com preserves an earlier timeout in durable history while a later verified
 * native terminal result becomes the effective truth returned to every future observer.
 */
function fromRecord(record, incoming, waitMs = 0, retry = null) {
	if (!record) return unknown(incoming);
	if (!matches(record.expected, incoming, retry)) {
		return conflict(record.expected, incoming);
	}
	if (["completed", "failed", "expired"].includes(record.state)) {
		return Result.effectiveData(record);
	}
	return pending(record, waitMs, true);
}

/** Returns whether incoming observation identity belongs to the stored deed. */
function matches(stored = {}, incoming = {}, retry = null) {
	if (!retry) return Expectation.sameExpectation(stored, incoming);
	return stored.registrationKey === incoming.registrationKey &&
		(!retry.requestedAction || retry.requestedAction === stored.requestedAction);
}

/** Builds one nonterminal observation envelope without authorizing redispatch. */
function pending(record, waitMs = 0, recoveredAfterRestart = false) {
	const expected = record.expected || {};
	const timeout = Envelopes.timeoutEnvelope(
		expected,
		waitMs,
		expected.timeoutMs,
		record
	);
	return {
		...timeout,
		error: "canonical_request_pending",
		recoveredAfterRestart,
		reconciliationRequired: Boolean(record.dispatchedAt && !record.acceptedAt),
		message: timeout.message
	};
}

/** Builds a fail-closed observation for an unknown canonical request identity. */
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

/** Builds an immutable-identity conflict without touching the native deed. */
function conflict(stored = {}, incoming = {}) {
	return Envelopes.conflictEnvelope(stored, incoming);
}

/** Reports that execution completed but durable server result persistence failed. */
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
