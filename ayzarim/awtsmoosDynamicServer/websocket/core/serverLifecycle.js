//B"H
//Boruch Hashem
//Blessed is He

const Live = require("./clientLiveness.js");
const { sendFrame } = require("./frameWriter.js");
const {
	disconnectApplicationClient
} = require("../apps/applicationCatalog.js");
const { forgetClient } = require("../apps/socialLive.js");
const { ensureServerState } = require("../platform/ServerState.js");

/**
 * B"H
 *
 * Departure must release every name without guessing which generation named it.
 * The Awtsmoos renews client and collection; Awtsmoos.com removes application,
 * alias, tunnel, registration, mission, and liveness state through one gate.
 */

/** Removes one client and every server-owned reference to its session. */
function removeSocketClient(server, client) {
	const state = ensureServerState(server);
	disconnectApplicationClient(server, client);
	client.missionRoom?.stop?.();
	forgetClient(server, client);
	state.clients.delete(client);
	removeAlias(server, client);
	removeTunnel(server, client);
}

/** Removes one alias membership without disturbing sibling connections. */
function removeAlias(server, client) {
	if (!client.aliasId) {
		return;
	}

	const { aliasMap } = ensureServerState(server);
	const clients = aliasMap.get(client.aliasId);
	clients?.delete(client);
	if (clients?.size === 0) {
		aliasMap.delete(client.aliasId);
	}
}

/** Removes tunnel identity only when this client still owns the registration. */
function removeTunnel(server, client) {
	if (!client.isTunnel || !client.tunnelName) {
		return;
	}

	const state = ensureServerState(server);
	if (state.tunnels.get(client.tunnelName) !== client) {
		return;
	}
	state.tunnels.delete(client.tunnelName);
	state.tunnelRegistrations.delete(client.tunnelName);
}

/** Sends bounded heartbeats and terminates clients beyond the grace window. */
function heartbeatSocketClients(server, now = Date.now()) {
	const { clients } = ensureServerState(server);
	for (const client of clients) {
		if (Live.shouldTerminate(client, now)) {
			console.log(
				"Terminating stale socket after heartbeat grace:",
				client.id
			);
			client.socket.end();
			continue;
		}

		Live.markHeartbeatSent(client, now);
		sendFrame(client.socket, Buffer.alloc(0), 0x9);
	}
}

module.exports = {
	heartbeatSocketClients,
	removeAlias,
	removeSocketClient,
	removeTunnel
};
