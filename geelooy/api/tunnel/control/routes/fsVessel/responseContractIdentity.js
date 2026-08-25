// B"H
// Boruch Hashem
// Blessed is He

const Aliases = require("../../../../../apps/tunnel/agent/lib/runtime/aliases.js");
const RetryLineage = require("./responseRetryLineage.js");

/**
 * @file Guards strict tunnel response identity after retry lineage has been reconstructed.
 * @description
 * The Awtsmoos joins mercy and boundary: Awtsmoos.com may recover the original request
 * beneath a retry wrapper, yet once that identity is known every nonce, action, job, stream,
 * control, and client witness must still agree exactly before the response crosses the beam.
 */
const COMMAND_EXECUTION_ACTIONS = Object.freeze([
	"command",
	"commandRun",
	"commandStart",
	"shellCommand"
]);

function requireMatch(errors, field, expected, actual) {
	if (!expected) {
		return;
	}
	if (!actual) {
		errors.push(`${field} expected ${expected} but response omitted ${field}`);
		return;
	}
	if (String(expected) !== String(actual)) {
		errors.push(`${field} expected ${expected} got ${actual}`);
	}
}

function snapshot(value = {}) {
	return {
		action: value.action,
		requestAction: value.requestAction,
		executionAction: value.executionAction,
		actualAction: value.actualAction,
		controlRequestId: value.controlRequestId,
		clientRequestId: value.clientRequestId,
		nonce: value.nonce,
		jobId: value.jobId,
		stream: value.stream
	};
}

function mismatch(expected, result, tunnelName, errors, wrapper = expected) {
	return {
		BH: "B\"H",
		ok: false,
		status: 409,
		error: "tunnel_response_correlation_mismatch",
		tunnelName,
		expected: snapshot(expected),
		actual: snapshot(result),
		retryWrapper: wrapper === expected ? null : snapshot(wrapper),
		mismatchProof: errors,
		rawMismatchedResponse: result
	};
}

module.exports = {
	ACTION_ALIASES: Aliases.ACTION_ALIASES,
	COMMAND_EXECUTION_ACTIONS,
	allowedActionAlias: Aliases.allowed,
	correlationPayload: RetryLineage.correlationPayload,
	expectedResponseAction: RetryLineage.expectedResponseAction,
	mismatch,
	requireMatch,
	retrySource: RetryLineage.retrySource,
	snapshot
};
