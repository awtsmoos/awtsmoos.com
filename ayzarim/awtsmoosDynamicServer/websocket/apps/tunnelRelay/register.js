// B"H
// Boruch Hashem
// Blessed is He

const { sendJson } = require("../wsUtilities.js");
const { cleanId } = require("./normalizers.js");
const { isValidTunnelName } = require("./validation.js");
const Authority = require("./registrationAuthority.js");
const Transfer = require("./registrationTransfer.js");
const { ensureServerState } = require("../../platform/ServerState.js");

/**
 * B"H
 *
 * Registration is a guarded transfer of authority, not newest-packet-wins.
 * The Awtsmoos renews incumbent and contender; Awtsmoos.com preserves healthy
 * modern ownership while allowing equal restarts, upgrades, and stale recovery.
 */
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

	const state = ensureServerState(server);
	const previous = state.tunnels.get(tunnelName);
	const decision = Authority.decide(previous, contenderDescriptor(client, data));
	if (decision.action === "fence") {
		return Transfer.reject(
			server,
			client,
			tunnelName,
			decision,
			previous
		);
	}

	const replaced = decision.action === "replace"
		? Transfer.closePrevious(server, tunnelName, client)
		: null;
	const descriptor = Transfer.apply(server, client, data, tunnelName);
	state.tunnels.set(tunnelName, client);
	state.tunnelRegistrations.set(tunnelName, descriptor);
	state.clients.add(client);
	sendJson(client, {
		type: "TUNNEL_ACK",
		ok: true,
		name: tunnelName,
		tunnelName,
		replacedOlderConnection: Boolean(replaced),
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		registrationGeneration: client.registrationGeneration,
		serverTime: new Date().toISOString()
	});
	return true;
}

function contenderDescriptor(client, data) {
	return {
		client,
		agentVersion: data.agentVersion,
		browserAgent: data.browserAgent === true,
		protocolVersion: data.protocolVersion,
		vesselType: data.vesselType
	};
}

module.exports = {
	applyRegistration: Transfer.apply,
	closePreviousTunnel: Transfer.closePrevious,
	contenderDescriptor,
	handleTunnelRegister,
	rejectContender: Transfer.reject
};
