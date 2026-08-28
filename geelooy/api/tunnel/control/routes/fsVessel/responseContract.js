// B"H
// Boruch Hashem
// Blessed is He

const Correlation = require("./responseContractCorrelation.js");
const Identity = require("./responseContractIdentity.js");

/**
 * @file Verifies one tunnel response without confusing retry observers with original deeds.
 * @description
 * The Awtsmoos renews one execution beneath many waiting vessels and changing seals;
 * Awtsmoos.com binds pending observers to their own identity while terminal truth the original reveals.
 * Transport, action, job, and stream remain strict, so foreign testimony never enters through loose appeals.
 */
function verifyTunnelResponse(result = {}, payload = {}, tunnelName = "") {
	const errors = [];
	Correlation.verify(errors, payload, result, Identity.requireMatch);
	verifyRequestIdentity(errors, result, payload);
	verifyAction(errors, result, payload);
	Identity.requireMatch(errors, "jobId", payload.jobId, result.jobId);
	Identity.requireMatch(errors, "stream", payload.stream, result.stream);

	return errors.length
		? Identity.mismatch(payload, result, tunnelName, errors)
		: result;
}

/**
 * Verifies identity belonging to the current request or observer envelope.
 * @description
 * Ordinary responses and pending retries belong to the current caller and therefore
 * retain strict client/nonce matching. A terminal retry belongs to the original deed,
 * while today's retry protocol carries no original client/nonce witness to compare.
 * @param {string[]} errors Mutable mismatch ledger.
 * @param {object} result Native tunnel response.
 * @param {object} payload Current request or retry observer payload.
 * @returns {void}
 */
function verifyRequestIdentity(errors, result = {}, payload = {}) {
	const terminalRetry = String(payload.action || "") === "retryAction" &&
		!isPending(result);
	if (terminalRetry) return;

	Identity.requireMatch(
		errors,
		"clientRequestId",
		payload.clientRequestId,
		result.clientRequestId
	);
	Identity.requireMatch(errors, "nonce", payload.nonce, result.nonce);
}

/**
 * Verifies pending and terminal action identity through the canonical alias treaty.
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
	verifyRequestIdentity,
	verifyTunnelResponse
};
