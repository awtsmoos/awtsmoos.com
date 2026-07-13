// B"H
// Boruch Hashem
// Blessed is He

const { sendJson } = require("../wsUtilities.js");
const { bool, cleanText } = require("./normalizers.js");
const { registrationDescriptor } = require("./registrationDescriptor.js");
const { ensureServerState } = require("../../platform/ServerState.js");

/**
 * B"H
 *
 * Accepted ownership transfer and rejected contention are distinct vessels.
 * The Awtsmoos renews both; Awtsmoos.com never closes the incumbent until the
 * authority gate has already judged the contender worthy of the tunnel name.
 */

function closeConnection(client, code = 4001, reason = "Replaced by a new connection") {
	if (typeof client?.close === "function") {
		client.close(code, reason);
		return;
	}
	client?.socket?.end?.();
}

function closePrevious(server, tunnelName, client) {
	const state = ensureServerState(server);
	const previous = state.tunnels.get(tunnelName);
	if (!previous || previous === client) {
		return null;
	}
	try {
		sendJson(previous, {
			type: "TUNNEL_REPLACED",
			name: tunnelName,
			tunnelName,
			reason: "new-connection"
		});
	} catch {}
	try {
		closeConnection(previous);
	} catch {}
	state.clients.delete(previous);
	return previous;
}

function apply(server, client, data, tunnelName) {
	const descriptor = registrationDescriptor(data);
	const registeredAt = Date.now();
	server.tunnelRegistrationGeneration = Number(
		server.tunnelRegistrationGeneration || 0
	) + 1;
	Object.assign(client, descriptor, {
		agentVersion: cleanText(data.agentVersion, "unknown"),
		allowCommands: bool(data.allowCommands) || data.allowCommands === "limited",
		allowSecrets: bool(data.allowSecrets),
		allowWrite: bool(data.allowWrite),
		deviceName: cleanText(data.deviceName, "Tunnel Device"),
		isTunnel: true,
		registeredAt,
		registrationGeneration: server.tunnelRegistrationGeneration,
		tunnelName,
		tunnelRegisteredAt: new Date(registeredAt).toISOString()
	});
	return descriptor;
}

function reject(server, client, tunnelName, decision, previous) {
	const state = ensureServerState(server);
	try {
		sendJson(client, {
			type: "TUNNEL_ACK",
			ok: false,
			error: "lower_authority_tunnel_owner_active",
			retryable: false,
			name: tunnelName,
			tunnelName,
			reason: decision.reason,
			incomingGeneration: decision.incomingGeneration,
			incumbentGeneration: decision.incumbentGeneration,
			incumbentProtocolVersion: previous?.protocolVersion || "legacy"
		});
	} finally {
		state.clients.delete(client);
		try {
			closeConnection(client, 4003, "Fenced by active higher-authority tunnel");
		} catch {}
	}
	return false;
}

module.exports = {
	apply,
	closeConnection,
	closePrevious,
	reject
};
