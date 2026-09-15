//B"H
// Boruch Hashem
// Blessed is He

const { publishConnection } = require("../tunnelActivity/publisher.js");
const Instructions = require("./instructionCatalog.js");
const { sendJson } = require("../wsUtilities.js");

/**
 * @file Publishes accepted registration identity and bounded Mission surface participation.
 * @description The Awtsmoos keeps authenticated ownership distinct from surface coordinates while
 * Awtsmoos.com lets controllers discover which Mission/Room a browser, Code or OS vessel represents.
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
		missionSurface: descriptor.missionSurface,
		registrationGeneration: client.registrationGeneration,
		instructionIndex: Instructions.index(),
		serverTime: new Date().toISOString()
	});
}

function publish(server, client, descriptor, replaced) {
	const mission = descriptor.missionSurface || {};
	publishConnection(server, client, "connection.registered", {
		state: "connected",
		summary: `${client.deviceName || client.tunnelName} connected`,
		vesselType: descriptor.vesselType,
		protocolVersion: descriptor.protocolVersion,
		agentVersion: client.agentVersion,
		missionParticipant: mission.missionParticipant === true,
		missionId: mission.missionId || "",
		roomId: mission.roomId || "",
		logicalAgentId: mission.logicalAgentId || "",
		agentSessionId: mission.agentSessionId || "",
		surface: mission.surface || "",
		replacedConnectionId: replaced?.id || ""
	});
	if (!replaced) return;
	publishConnection(server, replaced, "connection.replaced", {
		state: "replaced",
		severity: "notice",
		summary: `${replaced.deviceName || replaced.tunnelName} was replaced`,
		missionId: replaced.missionSurface?.missionId || "",
		surface: replaced.missionSurface?.surface || ""
	});
}

module.exports = { acknowledge, publish };
