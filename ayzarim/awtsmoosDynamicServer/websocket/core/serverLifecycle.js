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
 * The Awtsmoos keeps each heartbeat failure inside its own client vessel. One
 * slow, closed, or malformed connection can never prevent sibling tunnels from
 * receiving their liveness frames.
 */
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

function removeAlias(server, client) {
	if (!client.aliasId) return;
	const { aliasMap } = ensureServerState(server);
	const clients = aliasMap.get(client.aliasId);
	clients?.delete(client);
	if (clients?.size === 0) aliasMap.delete(client.aliasId);
}

function removeTunnel(server, client) {
	if (!client.isTunnel || !client.registrationKey) return;
	const state = ensureServerState(server);
	if (state.tunnels.get(client.registrationKey) !== client) return;
	state.tunnels.delete(client.registrationKey);
	state.tunnelRegistrations.delete(client.registrationKey);
}

function heartbeatSocketClients(server, now = Date.now()) {
	const { clients } = ensureServerState(server);
	for (const client of [...clients]) heartbeatOne(server, client, now);
}

function heartbeatOne(server, client, now) {
	try {
		if (Live.shouldTerminate(client, now)) {
			publishConnection(server, client, "connection.stale", {
				state: "terminating",
				severity: "warning",
				summary: `${client.deviceName || client.tunnelName || client.id} heartbeat expired`
			});
			client.socket.end();
			return false;
		}

		const accepted = sendFrame(client.socket, Buffer.alloc(0), 0x9);
		if (accepted) {
			Live.markHeartbeatSent(client, now);
			client.heartbeatWriteDeferred = false;
			return true;
		}

		client.heartbeatWriteDeferred = true;
		client.lastTransportError = client.socket?.destroyed || client.socket?.writable !== true
			? "heartbeat_socket_not_writable"
			: "heartbeat_socket_backpressure";
		if (client.socket?.destroyed || client.socket?.writable !== true) {
			client.socket?.end?.();
		}
		return false;
	} catch (error) {
		client.lastTransportError = `heartbeat_write_failed:${String(error?.message || error).slice(0, 300)}`;
		try { client.socket?.end?.(); } catch {}
		return false;
	}
}

function publishDeparture(server, client) {
	if (!client.accountId && !client.identity?.accountId) return;
	publishConnection(server, client, "connection.disconnected", {
		state: "offline",
		severity: "notice",
		summary: `${client.deviceName || client.tunnelName || client.id} disconnected`
	});
}

module.exports = {
	heartbeatOne,
	heartbeatSocketClients,
	removeAlias,
	removeSocketClient,
	removeTunnel
};
