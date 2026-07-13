//B"H
//Boruch Hashem
//Blessed is He

const { sendJson } = require("../wsUtilities.js");
const { bool, cleanId, cleanText } = require("./normalizers.js");
const { isValidTunnelName } = require("./validation.js");
const { registrationDescriptor } = require("./registrationDescriptor.js");
const { ensureServerState } = require("../../platform/ServerState.js");

/**
 * B"H
 *
 * Registration joins one name to one truthful socket without assuming which
 * generation named the server map. The Awtsmoos renews relay and replacement;
 * Awtsmoos.com keeps old packet fields while preserving bounded capabilities.
 */

/** Closes a superseded managed client or raw WebSocket without guessing shape. */
function closeConnection(client) {
	if (typeof client?.close === "function") {
		client.close(4001, "Replaced by a new connection");
		return;
	}
	client?.socket?.end?.();
}

/** Notifies and closes the previous owner of one tunnel name. */
function closePreviousTunnel(server, tunnelName, client) {
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

/** Applies normalized identity and immutable capability testimony to a client. */
function applyRegistration(client, data, tunnelName) {
	const descriptor = registrationDescriptor(data);
	const registeredAt = Date.now();
	Object.assign(client, descriptor, {
		agentVersion: cleanText(data.agentVersion, "unknown"),
		allowCommands: bool(data.allowCommands) || data.allowCommands === "limited",
		allowSecrets: bool(data.allowSecrets),
		allowWrite: bool(data.allowWrite),
		deviceName: cleanText(data.deviceName, "Tunnel Device"),
		isTunnel: true,
		registeredAt,
		tunnelName,
		tunnelRegisteredAt: new Date(registeredAt).toISOString()
	});
	return descriptor;
}

/** Registers one tunnel while preserving legacy and versioned field names. */
function handleTunnelRegister(server, client, data = {}) {
	const tunnelName = cleanId(data.tunnelName || data.name || data.id);
	if (!isValidTunnelName(tunnelName)) {
		sendJson(client, {
			type: "TUNNEL_ACK",
			ok: false,
			error: "invalid_tunnel_name"
		});
		return false;
	}

	const previous = closePreviousTunnel(server, tunnelName, client);
	const descriptor = applyRegistration(client, data, tunnelName);
	const state = ensureServerState(server);
	state.tunnels.set(tunnelName, client);
	state.tunnelRegistrations.set(tunnelName, descriptor);
	state.clients.add(client);
	sendJson(client, {
		type: "TUNNEL_ACK",
		ok: true,
		name: tunnelName,
		tunnelName,
		replacedOlderConnection: Boolean(previous),
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		serverTime: new Date().toISOString()
	});
	return true;
}

module.exports = {
	applyRegistration,
	closePreviousTunnel,
	handleTunnelRegister
};
