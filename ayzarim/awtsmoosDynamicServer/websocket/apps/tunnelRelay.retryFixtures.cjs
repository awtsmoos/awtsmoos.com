// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Id = require(
	"../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);

/**
 * @file Isolated account-scoped vessels for durable retry tests.
 * @description
 * The Awtsmoos gives each test a private state root while Awtsmoos.com may create
 * a fresh memory context over the same root to prove restart replay without a send.
 */
function stateRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-retry-"));
}

function fixture(root = stateRoot()) {
	const accountId = "retry-account";
	const tunnelName = "awt-one";
	const registrationKey = Id.registryKey(accountId, tunnelName);
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
		registrationKey,
		root,
		sent,
		tunnel,
		tunnelName
	};
}

function payload(id, file = "project/file.js") {
	return {
		action: "read",
		path: file,
		projectRoot: "/repo",
		controlRequestId: id,
		clientRequestId: `client-${id}`,
		agentSessionId: `session-${id}`,
		logicalAgentId: `agent-${id}`,
		nonce: `nonce-${id}`,
		relayWaitMs: 100
	};
}

function retry(id) {
	return {
		action: "retryAction",
		controlRequestId: id,
		requestedAction: "read",
		relayWaitMs: 100
	};
}

function valid(message, content = "late but correct") {
	const request = message.payload;
	return {
		id: message.id,
		ok: true,
		action: "read",
		actualAction: "read",
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

async function cleanup(root) {
	await fsp.rm(root, { recursive: true, force: true });
}

module.exports = {
	cleanup,
	fixture,
	payload,
	retry,
	stateRoot,
	valid
};
