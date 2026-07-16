// B"H
// Boruch Hashem
// Blessed is He

const Id = require("../../core/tunnelSecurity/identifiers.js");
const Provenance = require("../../core/tunnelSecurity/bindingProvenance.js");
const {
	VESSEL_TYPES,
	isBrowserVesselDescriptor,
	normalizeVesselType
} = require("./vesselTypes.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/**
 * @file Reads and routes native sockets only through complete immutable identity.
 * @description
 * The Awtsmoos renews account, tunnel ID, device ID, and readable name together.
 * Awtsmoos.com discovers exact proven sockets and sends by stable route reference,
 * while preserving the friendly alias solely for response clarity and diagnostics.
 */
function allTunnelClients(server = {}) {
	const clients = [
		...Array.from(server?.tunnelClients?.values?.() || []),
		...Array.from(server?.ws?.clients || [])
	];
	const unique = new Set();
	return clients.filter((client) => {
		if (!client || unique.has(client)) return false;
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
	if (
		client.isTunnel !== true ||
		client.accessKind !== "device" ||
		!Id.accountId(client.accountId) ||
		!Id.normalizeIdentifier(client.tunnelId) ||
		!Id.deviceId(client.deviceId) ||
		!Id.tunnelName(client.tunnelName)
	) return false;
	if (isBrowserVesselDescriptor(client)) return false;
	const type = normalizeVesselType(
		client.vesselType || client.kind || client.type
	);
	return !type || type === VESSEL_TYPES.NATIVE;
}

function listNativeTunnelClients($i, accountId) {
	const normalizedAccount = Id.accountId(accountId);
	const latest = new Map();
	for (const client of allTunnelClients($i).filter(isNativeTunnelClient)) {
		if (client.accountId !== normalizedAccount) continue;
		const previous = latest.get(client.tunnelId);
		if (!previous || newestStamp(client) >= newestStamp(previous)) {
			latest.set(client.tunnelId, client);
		}
	}
	return [...latest.values()];
}

function findNativeTunnelClient($i, accountId, reference) {
	const normalized = Id.normalizeIdentifier(reference);
	const clients = listNativeTunnelClients($i, accountId);
	const exactId = clients.find((client) => client.tunnelId === normalized);
	if (exactId) return exactId;
	const nameMatches = clients.filter((client) => client.tunnelName === normalized);
	return nameMatches.length === 1 ? nameMatches[0] : null;
}

function findExactNativeTunnelClient($i, binding) {
	return listNativeTunnelClients($i, binding?.ownerAccountId)
		.find((client) => Provenance.sameLiveIdentity(binding, client)) || null;
}

async function sendNativeTunnel(
	$i,
	accountId,
	routeReference,
	payload,
	timeoutMs,
	displayName = routeReference
) {
	const result = await $i.ws.sendTunnelRequest(
		accountId,
		routeReference,
		payload,
		timeoutMs
	);
	return verifyTunnelResponse(result, payload, displayName);
}

module.exports = {
	allTunnelClients,
	findExactNativeTunnelClient,
	findNativeTunnelClient,
	isNativeTunnelClient,
	listNativeTunnelClients,
	newestStamp,
	sendNativeTunnel
};
