// B"H
// Boruch Hashem
// Blessed is He

const {
	VESSEL_TYPES,
	isBrowserVesselDescriptor
} = require("./vesselTypes.js");
const { browserCapabilities } = require("./capabilities.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/**
 * @file Projects browser tunnels only inside one authenticated account boundary.
 * @description
 * The Awtsmoos renews every tab, route ID, and readable label without confusion.
 * Awtsmoos.com filters by server-attached account identity, deduplicates by stable
 * route reference, and uses display names only after exact identity is selected.
 */
function listBrowserTunnelClients($i, accountId) {
	const latest = new Map();
	if (!$i.ws?.clients || !accountId) return [];
	for (const client of $i.ws.clients) {
		if (
			!client.isTunnel ||
			client.accountId !== accountId ||
			!client.tunnelName ||
			!isBrowserVesselDescriptor(client)
		) continue;
		const routeReference = client.tunnelId || client.tunnelName;
		const previous = latest.get(routeReference);
		if (!previous || Number(client.registeredAt || 0) >=
			Number(previous.registeredAt || 0)) {
			latest.set(routeReference, client);
		}
	}
	return [...latest.values()];
}

function publicBrowserTunnel(client = {}) {
	const routeReference = client.tunnelId || client.tunnelName || "";
	return {
		connected: true,
		tunnelId: client.tunnelId || "",
		tunnelName: client.tunnelName || "",
		routeReference,
		deviceId: client.deviceId || "",
		deviceName: client.deviceName || "Browser Tab",
		root: client.root || "browser://workspace",
		allowWrite: client.allowWrite !== false,
		allowSecrets: false,
		allowCommands: false,
		commandMode: "simulated",
		isAlive: client.isAlive !== false,
		agentVersion: client.agentVersion || null,
		tools: client.tools || null,
		capabilities: browserCapabilities(client),
		registeredAt: client.registeredAt || null,
		kind: VESSEL_TYPES.BROWSER,
		vesselType: VESSEL_TYPES.BROWSER
	};
}

function listBrowserTunnels($i, accountId) {
	return listBrowserTunnelClients($i, accountId).map(publicBrowserTunnel);
}

function findBrowserTunnelClient($i, accountId, reference) {
	const normalized = String(reference || "").trim();
	const clients = listBrowserTunnelClients($i, accountId);
	const exactId = clients.find((client) => client.tunnelId === normalized);
	if (exactId) return exactId;
	const names = clients.filter((client) => client.tunnelName === normalized);
	return names.length === 1 ? names[0] : null;
}

async function sendBrowserTunnel(
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
	findBrowserTunnelClient,
	listBrowserTunnelClients,
	listBrowserTunnels,
	publicBrowserTunnel,
	sendBrowserTunnel
};
