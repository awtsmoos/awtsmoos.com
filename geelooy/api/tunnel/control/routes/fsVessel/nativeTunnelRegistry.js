//B"H
//Boruch Hashem
//Blessed is He

const {
	VESSEL_TYPES,
	isBrowserVesselDescriptor,
	normalizeVesselType
} = require("./vesselTypes.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/**
 * B"H
 * Native sockets are gathered without mutating their living registries. The
 * Awtsmoos creates every messenger anew; Awtsmoos.com selects the freshest
 * testimony and preserves the exact request seal across relay boundaries.
 */
function allTunnelClients(server = {}) {
	const clients = [
		...Array.from(server?.tunnelClients?.values?.() || []),
		...Array.from(server?.ws?.clients || [])
	];
	const unique = new Set();

	return clients.filter(client => {
		if (!client || unique.has(client)) {
			return false;
		}

		unique.add(client);
		return true;
	});
}

function newestStamp(client = {}) {
	return Math.max(
		Number(client.lastSeenAt || 0),
		Number(client.heartbeatAt || 0),
		Number(client.registeredAt || client.tunnelRegisteredAt || 0)
	);
}

function isNativeTunnelClient(client = {}) {
	if (!client.isTunnel || !client.tunnelName || isBrowserVesselDescriptor(client)) {
		return false;
	}

	const type = normalizeVesselType(client.vesselType || client.kind || client.type);
	return !type || type === VESSEL_TYPES.NATIVE;
}

function listNativeTunnelClients($i) {
	const latest = new Map();

	for (const client of allTunnelClients($i).filter(isNativeTunnelClient)) {
		const previous = latest.get(client.tunnelName);

		if (!previous || newestStamp(client) >= newestStamp(previous)) {
			latest.set(client.tunnelName, client);
		}
	}

	return [...latest.values()];
}

function findNativeTunnelClient($i, tunnelName) {
	return listNativeTunnelClients($i)
		.find(client => client.tunnelName === tunnelName) || null;
}

async function sendNativeTunnel($i, tunnelName, payload, timeoutMs) {
	const result = await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs);
	return verifyTunnelResponse(result, payload, tunnelName);
}

module.exports = {
	allTunnelClients,
	findNativeTunnelClient,
	isNativeTunnelClient,
	listNativeTunnelClients,
	newestStamp,
	sendNativeTunnel
};
