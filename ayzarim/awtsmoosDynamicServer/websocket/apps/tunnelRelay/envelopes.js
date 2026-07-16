// B"H
// Boruch Hashem
// Blessed is He

/**
 * Relay-authored responses obey the same correlation contract as agent-authored
 * responses. An HTTP wait window may change state, never request identity.
 */
function identityEnvelope(expected = {}) {
	return compact({
		tunnelName: expected.tunnelName,
		requestedTunnelName: expected.requestedTunnelName,
		controlRequestId: expected.controlRequestId || expected.id,
		clientRequestId: expected.clientRequestId,
		agentSessionId: expected.agentSessionId,
		logicalAgentId: expected.logicalAgentId,
		projectRoot: expected.projectRoot,
		nonce: expected.nonce,
		jobId: expected.jobId,
		stream: expected.stream,
		cwd: expected.cwd,
		command: expected.command,
		path: expected.path,
		requestAction: expected.requestedAction,
		requestedAction: expected.requestedAction
	});
}

function retryPayload(expected = {}) {
	return {
		...identityEnvelope(expected),
		action: "retryAction",
		requestedAction: expected.requestedAction,
		autoPreview: false
	};
}

function timeoutEnvelope(expected, waitMs, timeoutMs) {
	const identity = identityEnvelope(expected);
	const retry = retryPayload(expected);
	return {
		BH: "B\"H",
		...identity,
		ok: false,
		action: "tunnelRequestPending",
		status: 202,
		pending: true,
		timeout: false,
		relayWaitTimedOut: true,
		waitedMs: waitMs,
		timeoutMs,
		resumeToken: identity.controlRequestId,
		next: {
			...retry,
			tunnelName: expected.tunnelName,
			params: JSON.stringify(retry)
		},
		retryPayload: retry,
		message: "Tunnel request is still alive; poll retryAction with controlRequestId instead of treating this as failure."
	};
}

function conflictEnvelope(stored, incoming) {
	return {
		BH: "B\"H",
		...identityEnvelope(incoming),
		ok: false,
		action: "tunnelRequestConflict",
		status: 409,
		error: "control_request_id_conflict",
		expected: stored,
		existing: incoming
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

function missingTunnelEnvelope(expected) {
	return {
		BH: "B\"H",
		...identityEnvelope(expected),
		ok: false,
		action: "tunnelRequestPending",
		status: 202,
		pending: true,
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
		...identityEnvelope({ ...expected, id: expected.id || id }),
		ok: false,
		action: "tunnelRequestPending",
		status: 202,
		pending: true,
		error: error.message,
		next: retryPayload(expected)
	};
}

function sendFailureEnvelope(id, expected, error) {
	return {
		BH: "B\"H",
		...identityEnvelope({ ...expected, id: expected.id || id }),
		ok: false,
		action: "tunnelRequestSendFailed",
		status: 503,
		pending: false,
		error: "tunnel_request_send_failed",
		message: error?.message || String(error || "Tunnel send failed.")
	};
}

function compact(value = {}) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => (
		item !== undefined && item !== null && item !== ""
	)));
}

module.exports = {
	compact,
	conflictEnvelope,
	disconnectedEnvelope,
	expiredEnvelope,
	identityEnvelope,
	missingTunnelEnvelope,
	relayErrorEnvelope,
	retryPayload,
	sendFailureEnvelope,
	timeoutEnvelope
};
