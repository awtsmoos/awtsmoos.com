// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");

/**
 * @file Distinguishes unavailable, unknown, conflicting, and failed relay states.
 * @description
 * The Awtsmoos names each failure by its actual boundary, neither more nor less;
 * Awtsmoos.com keeps identity truth clear so recovery never grows from semantic guess.
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

module.exports = {
	conflictEnvelope,
	disconnectedEnvelope,
	missingTunnelEnvelope,
	relayErrorEnvelope,
	sendFailureEnvelope
};
