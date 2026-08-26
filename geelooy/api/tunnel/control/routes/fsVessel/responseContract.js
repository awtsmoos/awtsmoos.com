// B"H
// Boruch Hashem
// Blessed is He

const Correlation = require("./responseContractCorrelation.js");
const Identity = require("./responseContractIdentity.js");

/**
 * @file Verifies one tunnel response against immutable deed and transport witnesses.
 * @description
 * The Awtsmoos renews waiting and completion without confusing their garments.
 * Awtsmoos.com binds ordinary responses to one canonical deed, while retry responses
 * preserve that deed and separately prove the relay transport that observed it.
 */
function verifyTunnelResponse(result = {}, payload = {}, tunnelName = "") {
	const errors = [];
	Correlation.verify(errors, payload, result, Identity.requireMatch);
	Identity.requireMatch(
		errors,
		"clientRequestId",
		payload.clientRequestId,
		result.clientRequestId
	);
	Identity.requireMatch(errors, "nonce", payload.nonce, result.nonce);
	verifyAction(errors, result, payload);
	Identity.requireMatch(errors, "jobId", payload.jobId, result.jobId);
	Identity.requireMatch(errors, "stream", payload.stream, result.stream);

	return errors.length
		? Identity.mismatch(payload, result, tunnelName, errors)
		: result;
}

/**
 * Verifies pending and terminal action identity through the canonical alias treaty.
 *
 * @param {string[]} errors Mutable mismatch ledger.
 * @param {object} result Native tunnel response.
 * @param {object} payload Original or retry request payload.
 * @returns {void}
 */
function verifyAction(errors, result, payload) {
	const expected = Identity.expectedResponseAction(payload);
	if (!expected) return;

	if (isPending(result)) {
		const requested = pendingRequestedAction(result);
		Identity.requireMatch(errors, "requestedAction", expected, requested);
		return;
	}

	const actual = terminalAction(result);
	if (actual && !Identity.allowedActionAlias(expected, actual)) {
		errors.push(`requestAction expected ${expected} got ${actual}`);
	}
}

/** Returns whether one response represents durable pending work. */
function isPending(result = {}) {
	return result.pending === true ||
		result.action === "tunnelRequestPending";
}

/** Returns the original requested deed recorded by a pending envelope. */
function pendingRequestedAction(result = {}) {
	return String(
		result.requestedAction ||
		result.retryPayload?.requestedAction ||
		result.requestAction ||
		""
	);
}

/** Returns the terminal deed that actually produced the response. */
function terminalAction(result = {}) {
	return String(
		result.actualAction ||
		result.requestAction ||
		result.requestedAction ||
		result.action ||
		""
	);
}

module.exports = {
	allowedActionAlias: Identity.allowedActionAlias,
	expectedResponseAction: Identity.expectedResponseAction,
	isPending,
	pendingRequestedAction,
	terminalAction,
	verifyTunnelResponse
};
