// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");

/**
	* @file Distinguishes unavailable, unknown, conflicting, and failed relay states.
	* @description The Awtsmoos refuses to dress true errors as accepted pending work.
	*/
function conflictEnvelope(stored, incoming) {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope(incoming),
		ok: false,
		action: "tunnelRequestConflict",
		status: 409,
		terminal: true,
		error: "control_request_id_conflict",
		expected: stored,
		existing: incoming
	};
}

function missingTunnelEnvelope(expected) {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope(expected),
		ok: false,
		action: "tunnelUnavailable",
		status: 503,
		state: "not_accepted",
		accepted: false,
		durable: false,
		terminal: false,
		pending: false,
		retryable: true,
		error: "no_tunnel_connected",
		next: { action: "awtsmoosMyDevice" }
	};
}

function disconnectedEnvelope(name, action, expected = {}) {
	return missingTunnelEnvelope({
		...expected,
		tunnelName: expected.tunnelName || name,
		requestedAction: expected.requestedAction || action
	});
}

function relayErrorEnvelope(id, expected, error) {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope({ ...expected, id: expected.id || id }),
		ok: false,
		action: "tunnelRequestStateUnknown",
		status: 503,
		state: "unknown",
		accepted: null,
		terminal: false,
		pending: false,
		retryable: true,
		error: error.message,
		next: Identity.retryPayload(expected)
	};
}

function sendFailureEnvelope(id, expected, error) {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope({ ...expected, id: expected.id || id }),
		ok: false,
		action: "tunnelRequestSendFailed",
		status: 503,
		state: "send_failed",
		accepted: false,
		durable: false,
		terminal: true,
		pending: false,
		retryable: false,
		error: "tunnel_request_send_failed",
		message: error?.message || String(error || "Tunnel send failed.")
	};
}

function transportStallEnvelope(expected = {}, reason = "device_transport_timeout", accepted = null) {
	return {
		BH: "B\"H",
		...Identity.identityEnvelope(expected),
		ok: false,
		action: "tunnelRequestTransportStalled",
		status: 504,
		state: accepted === true ? "accepted_not_consumed" : "not_accepted",
		accepted,
		durable: true,
		terminal: true,
		pending: false,
		retryable: false,
		error: reason,
		message: accepted === true
			? "The device accepted this request but did not begin consuming it before the transport deadline. The canonical request was ended so it cannot poison later tunnel work."
			: "The device did not acknowledge this request before the transport deadline. The canonical request was ended so reconnect recovery cannot replay it forever."
	};
}

module.exports = {
	conflictEnvelope,
	disconnectedEnvelope,
	missingTunnelEnvelope,
	relayErrorEnvelope,
	sendFailureEnvelope,
	transportStallEnvelope
};
