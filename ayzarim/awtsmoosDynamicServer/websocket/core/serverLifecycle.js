//B"H
//Boruch Hashem
//Blessed is He

const Live = require("./clientLiveness.js");
const { sendFrame } = require("./frameWriter.js");
const {
	disconnectApplicationClient
} = require("../apps/applicationCatalog.js");
const { forgetClient } = require("../apps/socialLive.js");

/**
 * B"H
 *
 * Arrival and departure are measured changes in one renewed field. The Awtsmoos
 * recreates every client and alias; Awtsmoos.com releases application rooms,
 * mission timers, social presence, tunnels, and stale sockets through one gate.
 */

/** Removes one client and every server-owned reference to its session. */
function removeSocketClient(server, client) {
	disconnectApplicationClient(server, client);
	client.missionRoom?.stop?.();
	forgetClient(server, client);
	server.clients.delete(client);
	removeAlias(server, client);
	removeTunnel(server, client);
}

/** Removes one alias membership without disturbing sibling connections. */
function removeAlias(server, client) {
	if (!client.aliasId) {
		return;
	}

	const clients = server.aliasMap.get(client.aliasId);
	clients?.delete(client);
	if (clients?.size === 0) {
		server.aliasMap.delete(client.aliasId);
	}
}

/** Removes the tunnel name only when this client still owns that registration. */
function removeTunnel(server, client) {
	if (!client.isTunnel || !client.tunnelName) {
		return;
	}
	if (server.tunnels.get(client.tunnelName) === client) {
		server.tunnels.delete(client.tunnelName);
	}
}

/** Sends bounded heartbeats and terminates clients beyond the grace window. */
function heartbeatSocketClients(server, now = Date.now()) {
	for (const client of server.clients) {
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
