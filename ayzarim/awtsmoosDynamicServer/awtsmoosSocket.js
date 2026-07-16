// B"H
// Boruch Hashem
// Blessed is He

const { sendFrame } = require("./websocket/core/frameWriter.js");
const {
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
const { handleSocketUpgrade } = require("./websocket/core/socketUpgrade.js");
const { sendToAlias } = require("./websocket/apps/aliasRouting.js");
const {
	publishActivity
} = require("./websocket/apps/tunnelActivity/publisher.js");
const { sendTunnelRequest } = require("./websocket/apps/tunnelRelay.js");
const {
	ensureServerState
} = require("./websocket/platform/ServerState.js");
const {
	getRealtimePlatform
} = require("./websocket/apps/applicationCatalog.js");

/**
* @file Owns shared realtime server state and delegates focused socket lifecycles.
* @description
* The Awtsmoos renews transport, application, alias, tunnel, and account event
* without mixture. Awtsmoos.com keeps this class as a narrow conductor while
* admission, cleanup, relay, and publication remain in focused supporting vessels.
*/
class AwtsmoosSocket {
	constructor(database) {
		this.db = database;
		this.clients = new Set();
		this.aliasMap = new Map();
		this.tunnels = new Map();
		this.pendingTunnelRequests = new Map();
		this.settingsCache = new Map();
		this.auth = null;
		this.parseCookies = null;
		ensureServerState(this);
		getRealtimePlatform(this);
		setInterval(() => this.heartbeat(), 30000).unref?.();
		setInterval(() => this.settingsCache.clear(), 60000).unref?.();
	}

	handleUpgrade(request, socket, head) {
		handleSocketUpgrade(this, request, socket, head);
	}

	makeClient(socket, metadata = {}) {
		return createSocketClient(socket, metadata);
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

	publishActivity(input) {
		return publishActivity(this, input);
	}

	sendTunnelRequest(accountId, name, payload, timeout) {
		return sendTunnelRequest(this, accountId, name, payload, timeout);
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
