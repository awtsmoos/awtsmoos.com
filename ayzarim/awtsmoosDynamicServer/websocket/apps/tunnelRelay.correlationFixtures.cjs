// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Id = require(
	"../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);

/**
 * @file Isolated account-scoped vessels for relay concurrency tests.
 * @description
 * The Awtsmoos renews request and response together. Awtsmoos.com gives each test
 * its own durable root while registry authority remains separate from public names.
 */
function createContext() {
	const accountId = "relay-account";
	const tunnelName = "awt-shared";
	const registrationKey = Id.registryKey(accountId, tunnelName);
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-correlation-"));
	const sent = [];
	const tunnel = {
		registrationKey,
		tunnelName,
		send(message) {
			sent.push(message);
		}
	};
	return {
		accountId,
		context: {
			tunnelRelayStateRoot: root,
			tunnels: new Map([[registrationKey, tunnel]]),
			pendingTunnelRequests: new Map()
		},
		root,
		sent,
		tunnel,
		tunnelName
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

module.exports = {
	createContext,
	payload,
	response
};
