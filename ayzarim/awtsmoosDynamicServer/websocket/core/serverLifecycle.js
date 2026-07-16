// B"H
// Boruch Hashem
// Blessed is He

const Live = require("./clientLiveness.js");
const { sendFrame } = require("./frameWriter.js");
const {
	disconnectApplicationClient
} = require("../apps/applicationCatalog.js");
const { forgetClient } = require("../apps/socialLive.js");
const {
	publishConnection
} = require("../apps/tunnelActivity/publisher.js");
const { ensureServerState } = require("../platform/ServerState.js");

/**
 * @file Releases socket state and publishes authoritative departure testimony.
 * @description
 * The Awtsmoos renews arrival and departure without abandoning one hidden name.
 * Awtsmoos.com removes application, alias, account-scoped registration, mission,
 * liveness, and activity subscription state through one complete lifecycle gate.
 */

/** Removes one client and every server-owned reference to its session. */
function removeSocketClient(server, client) {
	const state = ensureServerState(server);
	publishDeparture(server, client);
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

/** Removes tunnel identity only when this client still owns its scoped key. */
function removeTunnel(server, client) {
	if (!client.isTunnel || !client.registrationKey) {
		return;
	}
	const state = ensureServerState(server);
	if (state.tunnels.get(client.registrationKey) !== client) {
		return;
	}
	state.tunnels.delete(client.registrationKey);
	state.tunnelRegistrations.delete(client.registrationKey);
}

/** Sends bounded heartbeats and terminates clients beyond the grace window. */
function heartbeatSocketClients(server, now = Date.now()) {
	const { clients } = ensureServerState(server);
	for (const client of clients) {
		if (Live.shouldTerminate(client, now)) {
			publishConnection(server, client, "connection.stale", {
				state: "terminating",
				severity: "warning",
				summary: `${client.deviceName || client.tunnelName || client.id} heartbeat expired`
			});
			client.socket.end();
			continue;
		}
		Live.markHeartbeatSent(client, now);
		sendFrame(client.socket, Buffer.alloc(0), 0x9);
	}
}

function publishDeparture(server, client) {
	if (!client.accountId && !client.identity?.accountId) {
		return;
	}
	publishConnection(server, client, "connection.disconnected", {
		state: "offline",
		severity: "notice",
		summary: `${client.deviceName || client.tunnelName || client.id} disconnected`
	});
}

module.exports = {
	heartbeatSocketClients,
	removeAlias,
	removeSocketClient,
	removeTunnel
};
