// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");
const Phase = require("./relayPhase.js");

/**
 * @file Reports elapsed HTTP waiting without inventing device acceptance.
 * @description
 * The Awtsmoos keeps reservation, dispatch, custody, and motion distinct.
 * Awtsmoos.com returns one resumable identity plus the strongest proven phase, so
 * callers may observe the deed without duplicating a side effect.
 */
function timeoutEnvelope(expected, waitMs, timeoutMs, record = {}) {
	const identity = Identity.identityEnvelope(expected);
	const retry = Identity.retryPayload(expected);
	const evidence = Phase.describe({ ...record, expected });
	return {
		BH: "B\"H",
		...identity,
		...evidence,
		ok: true,
		action: "tunnelRequestPending",
		status: 202,
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
		message: Phase.message(evidence)
	};
}

function expiredEnvelope(record) {
	return {
		...timeoutEnvelope(
			record.expected,
			record.expected.timeoutMs,
			record.expected.timeoutMs,
			record
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
