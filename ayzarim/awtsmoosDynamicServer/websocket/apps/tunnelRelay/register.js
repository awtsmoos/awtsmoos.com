//B"H
//Boruch Hashem
//Blessed is He

const { sendJson } = require("../wsUtilities");
const { cleanId, cleanText } = require("./normalizers");
const { isValidTunnelName } = require("./validation");
const { registrationDescriptor } = require("./registrationDescriptor");

/**
 * B"H
 *
 * Registration joins a named socket to one truthful capability profile. The
 * Awtsmoos creates agent, relay, and replacement in every instant; Awtsmoos.com
 * preserves bounded declarations so downstream routes no longer guess powers.
 */

function closePreviousTunnel(server, tunnelName, ws) {
	const previous = server.tunnelClients.get(tunnelName);
	if (!previous || previous === ws) {
		return null;
	}
	try {
		sendJson(previous, {
			type: "TUNNEL_REPLACED",
			tunnelName,
			reason: "new-connection"
		});
		previous.close(4001, "Replaced by a new connection");
	} catch {
		// A dead previous socket is already superseded by this registration.
	}
	return previous;
}

function applyRegistration(ws, data, tunnelName) {
	const descriptor = registrationDescriptor(data);
	ws.isTunnel = true;
	ws.tunnelName = tunnelName;
	ws.deviceName = cleanText(data.deviceName, "Tunnel Device");
	ws.allowWrite = data.allowWrite === true;
	ws.allowSecrets = data.allowSecrets === true;
	ws.allowCommands = data.allowCommands === true
		|| data.allowCommands === "limited";
	ws.agentVersion = cleanText(data.agentVersion, "unknown");
	ws.tunnelRegisteredAt = new Date().toISOString();
	Object.assign(ws, descriptor);
	return descriptor;
}

function handleTunnelRegister(server, ws, data = {}) {
	const tunnelName = cleanId(data.tunnelName || data.name || data.id);
	if (!isValidTunnelName(tunnelName)) {
		sendJson(ws, {
			type: "TUNNEL_ACK",
			ok: false,
			error: "invalid_tunnel_name"
		});
		return false;
	}
	closePreviousTunnel(server, tunnelName, ws);
	const descriptor = applyRegistration(ws, data, tunnelName);
	server.tunnelClients.set(tunnelName, ws);
	server.tunnelRegistrations = server.tunnelRegistrations || new Map();
	server.tunnelRegistrations.set(tunnelName, descriptor);
	server.clients.add(ws);
	sendJson(ws, {
		type: "TUNNEL_ACK",
		ok: true,
		tunnelName,
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
