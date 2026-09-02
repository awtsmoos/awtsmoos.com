// B"H
// Boruch Hashem
// Blessed is He

const Live = require("./clientLiveness.js");
const { sendFrame } = require("./frameWriter.js");
const { disconnectApplicationClient } = require("../apps/applicationCatalog.js");
const { forgetClient } = require("../apps/socialLive.js");
const { publishConnection } = require("../apps/tunnelActivity/publisher.js");
const { ensureServerState } = require("../platform/ServerState.js");

/**
 * @file Enforces heartbeat failure as a terminal transport transition, never a zombie route.
 * @description
 * The Awtsmoos lets local pressure and remote silence testify in separate voices. Awtsmoos.com
 * permits bounded backpressure, but when proof expires it closes the old vessel completely so
 * a new registration—not a late frame—must reveal the route again.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING heartbeatIsolation.test.cjs
 * An unroutable tunnel must not remain open and later resurrect on the same generation.
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
		if (Live.shouldTerminate(client, now)) return terminateStale(server, client, now);
		const accepted = sendFrame(client.socket, Buffer.alloc(0), 0x9);
		if (accepted) {
			Live.markHeartbeatSent(client, now);
			if (Live.shouldTerminate(client, now)) return terminateStale(server, client, now);
			return true;
		}
		const reason = heartbeatWriteReason(client);
		Live.markHeartbeatDeferred(client, now, reason);
		if (Live.shouldTerminate(client, now)) return terminateStale(server, client, now);
		return false;
	} catch (error) {
		client.lastTransportError = `heartbeat_write_failed:${String(error?.message || error).slice(0, 300)}`;
		Live.fence(client, "heartbeat_write_failed", now);
		return terminateStale(server, client, now);
	}
}

function heartbeatWriteReason(client) {
	if (!Live.socketIsUsable(client)) return "heartbeat_socket_not_writable";
	return "heartbeat_socket_backpressure";
}

function terminateStale(server, client, now = Date.now()) {
	const snapshot = Live.livenessSnapshot(client, now);
	publishConnection(server, client, "connection.stale", {
		state: "terminating",
		severity: "warning",
		summary: `${client.deviceName || client.tunnelName || client.id} ${snapshot.livenessTerminalReason || "heartbeat expired"}`
	});
	try {
		if (typeof client.socket?.destroy === "function") client.socket.destroy();
		else client.socket?.end?.();
	} catch {}
	return false;
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
	heartbeatOne, heartbeatSocketClients, removeAlias, removeSocketClient, removeTunnel, terminateStale
};
