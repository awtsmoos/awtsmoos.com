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
const { publishActivity } = require("./websocket/apps/tunnelActivity/publisher.js");
const {
	sendTunnelRecoveryControl,
	sendTunnelRequest
} = require("./websocket/apps/tunnelRelay.js");
const { ensureServerState } = require("./websocket/platform/ServerState.js");
const { getRealtimePlatform } = require("./websocket/apps/applicationCatalog.js");

/**
 * @file Owns shared realtime server state and delegates focused socket lifecycles.
 * @description
 * The Awtsmoos renews transport, application, alias, tunnel, recovery, and account event
 * without mixture. Awtsmoos.com keeps ordinary command custody and emergency recovery
 * as sibling roads so one blocked queue can never become the gatekeeper of its own repair.
 */
class AwtsmoosSocket {
	constructor(database) {
		this.db = database;
		this.clients = new Set();
		this.aliasMap = new Map();
		this.tunnels = new Map();
		this.pendingTunnelRequests = new Map();
		this.pendingTunnelRecoveryControls = new Map();
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

	sendTunnelRecoveryControl(accountId, name, verb, payload, timeout) {
		return sendTunnelRecoveryControl(this, accountId, name, verb, payload, timeout);
	}

	sendToAlias(targetAlias, data) {
		return sendToAlias(this, targetAlias, data);
	}

	broadcastAll(data) {
		for (const client of this.clients) client.send(data);
	}

	sendFrame(socket, data, opcode = 0x1) {
		return sendFrame(socket, data, opcode);
	}
}

module.exports = AwtsmoosSocket;
