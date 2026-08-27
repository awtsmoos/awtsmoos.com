// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");

/**
	* @file Names elapsed HTTP waiting as successful durable request acceptance.
	* @description
	* The Awtsmoos keeps waiting nonterminal. Awtsmoos.com gives the caller one exact
	* continuation instead of a false failure when only the synchronous window ended.
	*/
function timeoutEnvelope(expected, waitMs, timeoutMs) {
	const identity = Identity.identityEnvelope(expected);
	const retry = Identity.retryPayload(expected);
	return {
		BH: "B\"H",
		...identity,
		ok: true,
		action: "tunnelRequestPending",
		status: 202,
		state: "accepted_pending",
		accepted: true,
		durable: true,
		terminal: false,
		pending: true,
		retryable: true,
		timeout: false,
		waitWindowElapsed: true,
		relayWaitTimedOut: true,
		healthImpact: "none",
		waitedMs: waitMs,
		timeoutMs,
		retryAfterMs: 100,
		resumeToken: identity.controlRequestId,
		next: {
			...retry,
			tunnelName: expected.tunnelName,
			routeReference: expected.routeReference || expected.tunnelName,
			params: JSON.stringify(retry)
		},
		routeReference: expected.routeReference || expected.tunnelName,
		retryPayload: retry,
		message: "Request accepted durably; the synchronous wait window elapsed. Continue with retryAction using the same controlRequestId."
	};
}

function expiredEnvelope(record) {
	return {
		...timeoutEnvelope(
			record.expected,
			record.expected.timeoutMs,
			record.expected.timeoutMs
		),
		ok: false,
		status: 504,
		state: "expired",
		accepted: false,
		durable: false,
		terminal: true,
		pending: false,
		retryable: false,
		timeout: true,
		healthImpact: "request",
		error: "tunnel_request_expired"
	};
}

module.exports = { expiredEnvelope, timeoutEnvelope };
