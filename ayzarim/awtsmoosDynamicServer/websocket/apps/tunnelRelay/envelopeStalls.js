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
		state: "not_accepted",
		accepted: false,
		durable: true,
		terminal: true,
		pending: false,
		retryable: false,
		healthImpact: "request_only",
		error: reason,
		message: "The request was not acknowledged before its acceptance deadline. Tunnel transport health remains independently determined."
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
