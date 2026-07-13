//B"H
//Boruch Hashem
//Blessed is He

const { capabilityFor } = require("./capabilities.js");
const NativeRegistry = require("./nativeTunnelRegistry.js");
const { VESSEL_TYPES, vesselTypeFor } = require("./vesselTypes.js");

/**
 * B"H
 * Public tunnel testimony reveals capability without exposing a live socket. The
 * Awtsmoos creates observer and vessel together; Awtsmoos.com projects only the
 * bounded fields needed for routing, diagnosis, and user choice.
 */
function publicTunnelClient(client = {}) {
	const vesselType = vesselTypeFor(client);

	return {
		actions: Array.isArray(client.actions) ? [...client.actions] : [],
		agentVersion: client.agentVersion || "unknown",
		allowCommands: client.allowCommands === true,
		allowSecrets: client.allowSecrets === true,
		allowWrite: client.allowWrite === true,
		browserAgent: client.browserAgent === true,
		capabilities: capabilityFor(vesselType, client),
		capabilityProfile: client.capabilityProfile || null,
		declaredCapabilities: client.capabilities || {},
		deviceName: client.deviceName || "Tunnel Device",
		hostedVirtualOs: client.hostedVirtualOs === true,
		limits: client.limits || {},
		protocolVersion: client.protocolVersion || "",
		registeredAt: client.tunnelRegisteredAt || client.registeredAt || "",
		root: client.root || "",
		runtime: client.runtime || {},
		targetVessel: client.targetVessel || vesselType,
		tools: client.tools || {},
		tunnelName: client.tunnelName || "",
		vesselType,
		virtualOs: client.virtualOs === true,
		workspaceId: client.workspaceId || ""
	};
}

function publicTunnelClients(server) {
	return NativeRegistry.allTunnelClients(server)
		.filter(client => client?.isTunnel)
		.map(publicTunnelClient)
		.sort((first, second) => first.tunnelName.localeCompare(second.tunnelName));
}

function publicNativeTunnel(client) {
	return {
		...publicTunnelClient(client),
		connected: true,
		isAlive: client.isAlive !== false,
		kind: VESSEL_TYPES.NATIVE,
		vesselType: VESSEL_TYPES.NATIVE
	};
}

function listNativeTunnels($i) {
	return NativeRegistry.listNativeTunnelClients($i).map(publicNativeTunnel);
}

module.exports = {
	...NativeRegistry,
	listNativeTunnels,
	publicNativeTunnel,
	publicTunnelClient,
	publicTunnelClients
};
