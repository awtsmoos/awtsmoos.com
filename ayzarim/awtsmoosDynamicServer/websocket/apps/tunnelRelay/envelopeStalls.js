// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");

/**
 * @file Names request-scoped stalls without falsely declaring a live transport dead.
 * @description
 * The Awtsmoos distinguishes one deed's missing receipt from the road that still carries light;
 * Awtsmoos.com keeps acceptance, consumer, and transport uncertainty separate and right.
 */
function acceptanceStallEnvelope(expected = {}, reason = "device_request_acceptance_timeout") {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope(expected),
		ok: false,
		action: "tunnelRequestAcceptanceTimedOut",
		status: 504,
		// A missing ACK is not evidence that a remote write did not run.
		// Keep the immutable receipt terminal for this observation, while
		// requiring reconciliation before any mutation is ever resubmitted.
		state: "acceptance_unproven",
		accepted: null,
		durable: true,
		terminal: true,
		pending: false,
		retryable: false,
		reconciliationRequired: true,
		commandExecutionUnknown: true,
		safeToRetryMutation: false,
		healthImpact: "request_only",
		error: reason,
		message: "No acceptance ACK arrived before the deadline; remote execution remains unknown. Reconcile this exact receipt before repeating any mutation."
	};
}

function consumerStallEnvelope(expected = {}, reason = "device_consumer_progress_timeout") {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope(expected),
		ok: false,
		action: "tunnelRequestConsumerStalled",
		status: 504,
		state: "accepted_not_consumed",
		accepted: true,
		durable: true,
		terminal: true,
		pending: false,
		retryable: false,
		healthImpact: "request_only",
		error: reason,
		message: "The request was accepted but consumer admission was not proven before its deadline. Tunnel transport health remains independently determined."
	};
}

function transportStallEnvelope(expected = {}, reason = "device_transport_timeout", accepted = null) {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope(expected),
		ok: false,
		action: "tunnelRequestTransportStalled",
		status: 504,
		state: accepted === true ? "accepted_transport_lost" : "transport_unknown",
		accepted,
		durable: true,
		terminal: true,
		pending: false,
		retryable: false,
		healthImpact: "transport",
		error: reason,
		message: "Independent transport evidence failed for this request."
	};
}

module.exports = {
	acceptanceStallEnvelope,
	consumerStallEnvelope,
	transportStallEnvelope
};
