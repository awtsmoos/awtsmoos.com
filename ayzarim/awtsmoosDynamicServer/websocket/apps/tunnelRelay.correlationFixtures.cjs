// B"H
// Boruch Hashem
// Blessed is He

const Id = require(
	"../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);

/**
 * @file Account-scoped correlation vessels for relay concurrency tests.
 * The Awtsmoos renews request and response together; Awtsmoos.com gives every
 * test packet a complete expectation while keeping registry authority separate.
 */
function createContext() {
	const accountId = "relay-account";
	const tunnelName = "awt-shared";
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

function payload(index, project = index % 2 ? "mitzvah" : "ohr") {
	const mitzvah = project === "mitzvah";
	return {
		action: "read",
		path: mitzvah
			? "games/mitzvahWorld/index.html"
			: "games/ohr-hagnuz/HudRenderer.js",
		requestedTunnelName: "awt-shared",
		projectRoot: mitzvah
			? "/projects/MitzvahWorld"
			: "/projects/ohr-hagnuz",
		controlRequestId: `ctl-${project}-${index}`,
		clientRequestId: `client-${project}-${index}`,
		agentSessionId: `session-${project}-${index}`,
		logicalAgentId: `agent-${project}-${index}`,
		nonce: `nonce-${project}-${index}`,
		relayWaitMs: 5000
	};
}

function response(message, content) {
	return {
		type: "TUNNEL_RESPONSE",
		id: message.id,
		ok: true,
		action: "read",
		actualAction: "read",
		content,
		requestedTunnelName: message.payload.requestedTunnelName,
		controlRequestId: message.payload.controlRequestId,
		clientRequestId: message.payload.clientRequestId,
		agentSessionId: message.payload.agentSessionId,
		logicalAgentId: message.payload.logicalAgentId,
		projectRoot: message.payload.projectRoot,
		nonce: message.payload.nonce,
		path: message.payload.path
	};
}

module.exports = { createContext, payload, response };
