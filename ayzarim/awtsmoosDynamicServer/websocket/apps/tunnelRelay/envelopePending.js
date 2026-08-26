// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");
const Phase = require("./relayPhase.js");

/**
 * @file Reports relay waiting with explicit observation and redispatch safety semantics.
 * @description
 * The Awtsmoos keeps reservation, dispatch, native custody, progress, and completion
 * distinct. Awtsmoos.com tells every caller whether it is observing a control request,
 * whether native acceptance is proven, and whether a new dispatch could duplicate a deed.
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
		durabilityMeaning: "canonical_request_record_only",
		terminal: false,
		pending: true,
		retryable: true,
		retryMeaning: "observe_existing_control_request",
		timeout: false,
		waitWindowElapsed: true,
		relayWaitTimedOut: true,
		healthImpact: "none",
		waitedMs: waitMs,
		timeoutMs,
		retryAfterMs: 100,
		resumeToken: identity.controlRequestId,
		deviceAcceptanceProven: evidence.deviceAccepted === true,
		blindRedispatchForbidden: true,
		freshRedispatchSafe: false,
		nextSafeAction: "retryAction",
		observeWith: retry,
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

/**
 * Returns terminal relay expiry without erasing stronger dispatch or acceptance evidence.
 * A never-dispatched expiry may be sent afresh; any dispatched deed must be reconciled.
 */
function expiredEnvelope(record = {}) {
	const base = timeoutEnvelope(
		record.expected,
		record.expected?.timeoutMs,
		record.expected?.timeoutMs,
		record
	);
	const dispatched = base.dispatched === true;
	return {
		...base,
		ok: false,
		status: 504,
		state: "expired",
		phase: base.phase || "expired",
		durable: true,
		durabilityMeaning: "canonical_request_record_only",
		terminal: true,
		pending: false,
		retryable: false,
		retryMeaning: "observe_or_reconcile_existing_control_request",
		timeout: true,
		healthImpact: "request",
		freshRedispatchSafe: !dispatched,
		blindRedispatchForbidden: dispatched,
		reconciliationRequired: dispatched,
		nextSafeAction: dispatched ? "retryAction" : "fresh_dispatch_allowed",
		error: "tunnel_request_expired"
	};
}

module.exports = {
	expiredEnvelope,
	timeoutEnvelope
};
