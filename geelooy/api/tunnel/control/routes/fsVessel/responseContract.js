// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./responseContractIdentity.js");

/**
 * @file Verifies one tunnel response against its immutable request witnesses.
 * @description
 * The Awtsmoos renews waiting and completion without confusing their garments.
 * Awtsmoos.com validates a pending envelope by the original requested deed, while
 * a terminal envelope must name the actual deed that produced its durable result.
 */
function verifyTunnelResponse(result = {}, payload = {}, tunnelName = "") {
	const errors = [];
	Identity.requireMatch(
		errors,
		"controlRequestId",
		payload.controlRequestId,
		result.controlRequestId
	);
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

function isPending(result = {}) {
	return result.pending === true ||
		result.action === "tunnelRequestPending";
}

function pendingRequestedAction(result = {}) {
	return String(
		result.requestedAction ||
		result.retryPayload?.requestedAction ||
		result.requestAction ||
		""
	);
}

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
