// B"H
// Boruch Hashem
// Blessed is He

const { VESSEL_TYPES, isBrowserVesselDescriptor } = require("./vesselTypes.js");
const { browserCapabilities } = require("./capabilities.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/**
 * @file Projects browser tunnels only inside a verified account boundary.
 * @description
 * The Awtsmoos renews every tab without letting one account borrow another's
 * workspace. Awtsmoos.com filters by server-attached account identity before
 * selecting freshness, revealing metadata, or forwarding a filesystem deed.
 */

/** Lists the newest browser socket for each name owned by one account. */
function listBrowserTunnelClients($i, accountId) {
	const latest = new Map();
	if (!$i.ws?.clients || !accountId) {
		return [];
	}
	for (const client of $i.ws.clients) {
		if (!client.isTunnel || client.accountId !== accountId) {
			continue;
		}
		if (!client.tunnelName || !isBrowserVesselDescriptor(client)) {
			continue;
		}
		const previous = latest.get(client.tunnelName);
		if (!previous || Number(client.registeredAt || 0) >=
			Number(previous.registeredAt || 0)) {
			latest.set(client.tunnelName, client);
		}
	}
	return [...latest.values()];
}

/** Returns a disclosure-safe browser tunnel descriptor. */
function publicBrowserTunnel(client = {}) {
	return {
		connected: true,
		tunnelId: client.tunnelId || "",
		tunnelName: client.tunnelName || "",
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

/** Lists public browser tunnels for one account. */
function listBrowserTunnels($i, accountId) {
	return listBrowserTunnelClients($i, accountId)
		.map(publicBrowserTunnel);
}

/** Finds one browser tunnel inside one verified account. */
function findBrowserTunnelClient($i, accountId, tunnelName) {
	return listBrowserTunnelClients($i, accountId)
		.find((client) => client.tunnelName === tunnelName) || null;
}

/** Sends through the account-scoped relay key. */
async function sendBrowserTunnel($i, accountId, tunnelName, payload, timeoutMs) {
	const result = await $i.ws.sendTunnelRequest(
		accountId,
		tunnelName,
		payload,
		timeoutMs
	);
	return verifyTunnelResponse(result, payload, tunnelName);
}

module.exports = {
	findBrowserTunnelClient,
	listBrowserTunnelClients,
	listBrowserTunnels,
	publicBrowserTunnel,
	sendBrowserTunnel
};
