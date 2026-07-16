// B"H
// Boruch Hashem
// Blessed is He

const Id = require(
	"../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);

/**
 * @file Account-scoped retry lifecycle vessels.
 * The Awtsmoos renews original and resumed requests; Awtsmoos.com keeps their
 * logical identity stable while every transport ID remains fresh and bounded.
 */
function fixture() {
	const accountId = "retry-account";
	const tunnelName = "awt-one";
	const registrationKey = Id.registryKey(accountId, tunnelName);
	const sent = [];
	const tunnel = {
		registrationKey,
		send(message) {
			sent.push(message);
		}
	};
	return {
		accountId,
		tunnelName,
		tunnel,
		sent,
		context: {
			tunnels: new Map([[registrationKey, tunnel]]),
			pendingTunnelRequests: new Map()
		}
	};
}

function payload(id, path = "project/file.js") {
	return {
		action: "read",
		path,
		projectRoot: "/repo",
		controlRequestId: id,
		clientRequestId: `client-${id}`,
		agentSessionId: `session-${id}`,
		logicalAgentId: `agent-${id}`,
		nonce: `nonce-${id}`,
		relayWaitMs: 100
	};
}

function valid(message, content = "late but correct") {
	const request = message.payload;
	const action = request.action === "retryAction"
		? request.requestedAction
		: request.action;
	return {
		id: message.id,
		ok: true,
		action,
		actualAction: action,
		controlRequestId: request.controlRequestId,
		clientRequestId: request.clientRequestId,
		agentSessionId: request.agentSessionId,
		logicalAgentId: request.logicalAgentId,
		projectRoot: request.projectRoot,
		nonce: request.nonce,
		path: request.path,
		content
	};
}

function pending(message) {
	return {
		id: message.id,
		ok: false,
		status: 202,
		action: "tunnelRequestPending",
		actualAction: "tunnelRequestPending",
		pending: true,
		controlRequestId: message.payload.controlRequestId,
		requestedAction: message.payload.requestedAction
	};
}

module.exports = { fixture, payload, pending, valid };
