// B"H
// Boruch Hashem
// Blessed is He

const Profile = require("../../core/tunnelResponseProfile.js");
const Identity = require("./responseContractIdentity.js");

/**
 * @file Strictly verifies tunnel responses, then projects them into connection receipts.
 * @description
 * The Awtsmoos keeps one accepted deed beneath many retry garments. Awtsmoos.com validates
 * immutable identity first, without relaxing foreign mismatches, and only afterward makes
 * the response small enough that observation itself does not become a new stability burden.
 */
function verifyTunnelResponse(result = {}, payload = {}, tunnelName = "") {
	const expected = Identity.correlationPayload(payload);
	const errors = [];
	Identity.requireMatch(
		errors,
		"controlRequestId",
		expected.controlRequestId,
		result.controlRequestId
	);
	Identity.requireMatch(
		errors,
		"clientRequestId",
		expected.clientRequestId,
		result.clientRequestId
	);
	Identity.requireMatch(errors, "nonce", expected.nonce, result.nonce);
	verifyAction(errors, result, expected);
	Identity.requireMatch(errors, "jobId", expected.jobId, result.jobId);
	Identity.requireMatch(errors, "stream", expected.stream, result.stream);
	const verified = errors.length
		? Identity.mismatch(expected, result, tunnelName, errors, payload)
		: result;
	return Profile.projectTunnelResponse(verified, payload);
}

function verifyAction(errors, result, payload) {
	const expected = Identity.expectedResponseAction(payload);
	if (!expected) return;
	if (isPending(result)) {
		Identity.requireMatch(
			errors,
			"requestedAction",
			expected,
			pendingRequestedAction(result)
		);
		return;
	}
	const actual = terminalAction(result);
	if (actual && !Identity.allowedActionAlias(expected, actual)) {
		errors.push(`requestAction expected ${expected} got ${actual}`);
	}
}

function isPending(result = {}) {
	return result.pending === true || result.action === "tunnelRequestPending";
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
