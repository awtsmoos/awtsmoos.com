// B"H
// Boruch Hashem
// Blessed is He

const { publishConnection } = require("../tunnelActivity/publisher.js");
const { sendJson } = require("../wsUtilities.js");

/**
 * @file Publishes the ownership transfer only after registration authority decides it.
 * @description
 * The Awtsmoos separates a proven identity from the moment it receives the route.
 * Awtsmoos.com keeps ordinary owner acknowledgements and activity publication here,
 * leaving candidate-probe authentication forever outside the ownership ceremony.
 */
function acknowledge(client, identity, descriptor, replaced) {
	sendJson(client, {
		type: "TUNNEL_ACK",
		ok: true,
		accountBound: true,
		tunnelId: identity.tunnelId,
		tunnelName: identity.tunnelName,
		replacedOlderConnection: Boolean(replaced),
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		registrationGeneration: client.registrationGeneration,
		serverTime: new Date().toISOString()
	});
}

function publish(server, client, descriptor, replaced) {
	publishConnection(server, client, "connection.registered", {
		state: "connected",
		summary: `${client.deviceName || client.tunnelName} connected`,
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		agentVersion: client.agentVersion,
		replacedConnectionId: replaced?.id || ""
	});
	if (!replaced) return;
	publishConnection(server, replaced, "connection.replaced", {
		state: "replaced",
		severity: "notice",
		summary: `${replaced.deviceName || replaced.tunnelName} was replaced`
	});
}

module.exports = { acknowledge, publish };
