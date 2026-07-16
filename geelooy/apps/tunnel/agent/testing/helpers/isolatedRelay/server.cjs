// B"H
// Boruch Hashem
// Blessed is He

const EventEmitter = require("node:events");
const net = require("node:net");
const { RelayConnection } = require("./connection.cjs");

/**
 * @file Hosts an isolated relay that can acknowledge, drop, and silence generations.
 * @description
 * The Awtsmoos renews each connection under deliberate fault. Awtsmoos.com records
 * every registration and message, sends canonical ACK testimony, and exposes exact
 * connection generations so tests can force recovery without touching the live tunnel.
 */
class IsolatedRelay extends EventEmitter {
	constructor(options = {}) {
		super();
		this.tunnelId = options.tunnelId || "tun_isolated_longevity";
		this.ackDelay = options.ackDelay || (() => 0);
		this.connections = [];
		this.registrations = [];
		this.messages = [];
		this.server = net.createServer(socket => this.accept(socket));
	}

	async listen() {
		await new Promise((resolve, reject) => {
			this.server.once("error", reject);
			this.server.listen(0, "127.0.0.1", resolve);
		});
		return this.address();
	}

	address() {
		const address = this.server.address();
		return `ws://127.0.0.1:${address.port}/relay`;
	}

	accept(socket) {
		const connection = new RelayConnection(socket, this.connections.length + 1);
		this.connections.push(connection);
		connection.on("message", message => this.observe(connection, message));
		connection.on("ping", payload => this.emit("ping", connection, payload));
		connection.on("close", () => this.emit("close", connection));
		this.emit("connection", connection);
	}

	observe(connection, message) {
		if (!message) return;
		this.messages.push({ connection: connection.sequence, message });
		if (message.type !== "TUNNEL_REGISTER") {
			this.emit("message", connection, message);
			return;
		}
		this.registrations.push({ connection: connection.sequence, packet: message });
		this.emit("registration", connection, message);
		const delay = Number(this.ackDelay(connection.sequence, message) || 0);
		setTimeout(() => this.acknowledge(connection, message), delay);
	}

	acknowledge(connection, packet) {
		if (connection.closed) return;
		connection.sendJson({
			type: "TUNNEL_ACK",
			ok: true,
			tunnelId: this.tunnelId,
			tunnelName: packet.tunnelName || packet.name,
			serverTime: new Date().toISOString()
		});
		this.emit("ack", connection, packet);
	}

	latest() {
		return this.connections.at(-1) || null;
	}

	async close() {
		for (const connection of this.connections) connection.destroy();
		await new Promise(resolve => this.server.close(resolve));
	}
}

function waitForEvent(emitter, name, predicate = () => true, timeoutMs = 10000) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => finish(new Error(`event_timeout:${name}`)), timeoutMs);
		function listener(...values) {
			if (!predicate(...values)) return;
			finish(null, values);
		}
		function finish(error, values) {
			clearTimeout(timer);
			emitter.removeListener(name, listener);
			error ? reject(error) : resolve(values);
		}
		emitter.on(name, listener);
	});
}

module.exports = {
	IsolatedRelay,
	waitForEvent
};
