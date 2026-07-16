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
 * @file Reads native relay sockets only through complete immutable identity.
 * @description
 * The Awtsmoos creates every messenger anew without erasing rightful borders.
 * Awtsmoos.com rejects name-only and account-only sockets; native discovery needs
 * server-authenticated account, tunnel ID, device ID, canonical name, and device kind.
 */

function allTunnelClients(server = {}) {
	const clients = [
		...Array.from(server?.tunnelClients?.values?.() || []),
		...Array.from(server?.ws?.clients || [])
	];
	const unique = new Set();
	return clients.filter((client) => {
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

/** Returns true only for a server-authenticated native device socket. */
function isNativeTunnelClient(client = {}) {
	if (
		client.isTunnel !== true ||
		client.accessKind !== "device" ||
		!Id.accountId(client.accountId) ||
		!Id.normalizeIdentifier(client.tunnelId) ||
		!Id.deviceId(client.deviceId) ||
		!Id.tunnelName(client.tunnelName)
	) {
		return false;
	}
	if (isBrowserVesselDescriptor(client)) {
		return false;
	}
	const type = normalizeVesselType(
		client.vesselType || client.kind || client.type
	);
	return !type || type === VESSEL_TYPES.NATIVE;
}

function listNativeTunnelClients($i, accountId) {
	const normalizedAccount = Id.accountId(accountId);
	const latest = new Map();
	for (const client of allTunnelClients($i).filter(isNativeTunnelClient)) {
		if (client.accountId !== normalizedAccount) {
			continue;
		}
		const previous = latest.get(client.tunnelId);
		if (!previous || newestStamp(client) >= newestStamp(previous)) {
			latest.set(client.tunnelId, client);
		}
	}
	return [...latest.values()];
}

function findNativeTunnelClient($i, accountId, tunnelName) {
	return listNativeTunnelClients($i, accountId).find((client) => {
		return client.tunnelName === Id.tunnelName(tunnelName);
	}) || null;
}

/** Finds only the socket whose immutable identity matches a proven binding. */
function findExactNativeTunnelClient($i, binding) {
	return listNativeTunnelClients($i, binding?.ownerAccountId)
		.find((client) => Provenance.sameLiveIdentity(binding, client)) || null;
}

async function sendNativeTunnel($i, accountId, tunnelName, payload, timeoutMs) {
	const result = await $i.ws.sendTunnelRequest(
		accountId,
		tunnelName,
		payload,
		timeoutMs
	);
	return verifyTunnelResponse(result, payload, tunnelName);
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
