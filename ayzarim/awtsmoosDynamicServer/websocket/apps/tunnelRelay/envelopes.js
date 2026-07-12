// B"H

function timeoutEnvelope(expected, waitMs, timeoutMs) {
	const controlRequestId = expected.id;
	return {
		BH: "B\"H",
		ok: false,
		action: "tunnelRequestPending",
		status: 202,
		pending: true,
		timeout: false,
		relayWaitTimedOut: true,
		waitedMs: waitMs,
		timeoutMs,
		tunnelName: expected.tunnelName,
		requestedAction: expected.requestedAction,
		controlRequestId,
		resumeToken: controlRequestId,
		next: {
			action: "retryAction",
			tunnelName: expected.tunnelName,
			requestedAction: expected.requestedAction,
			controlRequestId,
			params: JSON.stringify({ controlRequestId, requestedAction: expected.requestedAction, autoPreview: false })
		},
		retryPayload: {
			action: "retryAction",
			controlRequestId,
			requestedAction: expected.requestedAction,
			autoPreview: false
		},
		message: "Tunnel request is still alive; poll retryAction with controlRequestId instead of treating this as failure."
	};
}

function conflictEnvelope(expected, existing) {
	return {
		BH: "B\"H",
		ok: false,
		status: 409,
		error: "control_request_id_conflict",
		controlRequestId: expected.id,
		expected,
		existing
	};
}

function expiredEnvelope(record) {
	return {
		...timeoutEnvelope(record.expected, record.expected.timeoutMs, record.expected.timeoutMs),
		status: 504,
		pending: false,
		timeout: true,
		error: "tunnel_request_expired"
	};
}

function disconnectedEnvelope(name, action) {
	return {
		BH: "B\"H",
		ok: false,
		status: 202,
		pending: true,
		error: "no_tunnel_connected",
		tunnelName: name,
		requestedAction: action || "",
		next: { action: "awtsmoosMyDevice" }
	};
}

function relayErrorEnvelope(id, expected, error) {
	return {
		BH: "B\"H",
		ok: false,
		status: 202,
		pending: true,
		error: error.message,
		tunnelName: expected.tunnelName,
		requestedAction: expected.requestedAction,
		next: { action: "retryAction", controlRequestId: id, requestedAction: expected.requestedAction }
	};
}

module.exports = { conflictEnvelope, disconnectedEnvelope, expiredEnvelope, relayErrorEnvelope, timeoutEnvelope };
