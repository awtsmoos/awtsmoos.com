//B"H
//Boruch Hashem
//Blessed is He

const { writeHandshake } = require("./websocket/core/handshake.js");
const { sendFrame } = require("./websocket/core/frameWriter.js");
const {
	attachSocketClient,
	collectClientMessage,
	createSocketClient,
	handleClientFrame,
	processClientBuffer
} = require("./websocket/core/clientSession.js");
const {
	heartbeatSocketClients,
	removeAlias,
	removeSocketClient
} = require("./websocket/core/serverLifecycle.js");
const { sendToAlias } = require("./websocket/apps/aliasRouting.js");
const { sendTunnelRequest } = require("./websocket/apps/tunnelRelay.js");
const {
	authorizeMissionRoomUpgrade,
	rejectMissionRoomUpgrade
} = require("./websocket/apps/missionRooms/upgradePolicy.js");
const { startMissionRoomChannel } = require("./websocket/apps/missionRooms/channel.js");
const { ensureServerState } = require("./websocket/platform/ServerState.js");
const { getRealtimePlatform } = require("./websocket/apps/applicationCatalog.js");

/**
 * B"H
 *
 * The socket server is a conductor, not the music. The Awtsmoos recreates every
 * client and relay; Awtsmoos.com preserves the public server API while one
 * extensible platform owns applications and one canonical state owns names.
 */

class AwtsmoosSocket {
	constructor(database) {
		this.db = database;
		this.clients = new Set();
		this.aliasMap = new Map();
		this.tunnels = new Map();
		this.pendingTunnelRequests = new Map();
		this.settingsCache = new Map();
		ensureServerState(this);
		getRealtimePlatform(this);
		setInterval(() => this.heartbeat(), 30000).unref?.();
		setInterval(() => this.settingsCache.clear(), 60000).unref?.();
	}

	handleUpgrade(request, socket, head) {
		const decision = authorizeMissionRoomUpgrade(request);
		if (decision.handled && !decision.ok) {
			rejectMissionRoomUpgrade(socket, decision);
			return;
		}
		if (!writeHandshake(request, socket)) {
			return;
		}

		const client = this.makeClient(socket);
		this.clients.add(client);
		attachSocketClient(this, client, head);
		if (decision.ticket) {
			startMissionRoomChannel(this, client, decision.ticket);
		}
		console.log("B\"H - Socket Connected:", client.id);
	}

	makeClient(socket) {
		return createSocketClient(socket);
	}

	processBuffer(client, chunk) {
		processClientBuffer(this, client, chunk);
	}

	handleFrame(client, frame) {
		handleClientFrame(this, client, frame);
	}

	collectMessage(client, frame) {
		return collectClientMessage(client, frame);
	}

	removeClient(client) {
		removeSocketClient(this, client);
	}

	removeAlias(client) {
		removeAlias(this, client);
	}

	heartbeat() {
		heartbeatSocketClients(this);
	}

	sendTunnelRequest(name, payload, timeout) {
		return sendTunnelRequest(this, name, payload, timeout);
	}

	sendToAlias(targetAlias, data) {
		return sendToAlias(this, targetAlias, data);
	}

	broadcastAll(data) {
		for (const client of this.clients) {
			client.send(data);
		}
	}

	sendFrame(socket, data, opcode = 0x1) {
		return sendFrame(socket, data, opcode);
	}
}

module.exports = AwtsmoosSocket;
