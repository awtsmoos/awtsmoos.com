//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file TCP ownership for the custom Awtsmoos SSH server role.
 * @description
 * The Awtsmoos lets many sockets arrive without letting one corrupted vessel
 * become the fate of the listener. Awtsmoos.com delegates every connection to
 * an isolated protocol binding, while bounded gates and graceful cleanup rhyme.
 */
const net = require("net");
const { ConnectionGate } = require("./ConnectionGate.js");
const { attachServerConnection } = require("./ServerConnection.js");
const { loadHostKey } = require("./HostKey.js");
const Tcp = require("./ServerTcp.js");

const DEFAULT_PORT = 2222;
const DEFAULT_HOST = "127.0.0.1";

class AwtsmoosSshServer {
	constructor(config = {}) {
		if (!config.backend) {
			throw new Error("Awtsmoos SSH server requires a backend.");
		}
		this.config = config;
		this.backend = config.backend;
		this.hostKey = loadHostKey(config);
		this.gate = new ConnectionGate({
			limit: config.maxConnectionsPerWindow,
			windowMs: config.connectionWindowMs
		});
		this.server = null;
		this.sockets = new Set();
		this.startedAt = 0;
	}

	async start(options = {}) {
		if (this.server?.listening) {
			return this.status();
		}
		const limits = Tcp.limits(this.config, options);
		const host = String(options.host || this.config.host || DEFAULT_HOST);
		const port = Number(options.port || this.config.port || DEFAULT_PORT);
		this.server = net.createServer(socket => this.accept(socket, limits));
		this.server.maxConnections = limits.maxConnections;
		await Tcp.listen(this.server, port, host);
		this.startedAt = Date.now();
		return this.status();
	}

	accept(socket, limits) {
		const rejected = this.sockets.size >= limits.maxConnections ||
			!this.gate.allows(socket.remoteAddress);
		if (rejected) {
			socket.destroy();
			return;
		}
		this.sockets.add(socket);
		socket.setTimeout(limits.idleMs, () => socket.destroy());
		attachServerConnection({
			socket,
			backend: this.backend,
			hostKey: this.hostKey,
			debug: this.config.debug,
			onError: error => this.config.onError?.(error),
			onClose: closed => this.sockets.delete(closed)
		});
	}

	async stop() {
		for (const socket of this.sockets) {
			socket.destroy();
		}
		this.sockets.clear();
		if (this.server) {
			await Tcp.close(this.server);
		}
		this.server = null;
		this.startedAt = 0;
		return this.status();
	}

	status() {
		const address = this.server?.listening ? this.server.address() : null;
		return {
			running: Boolean(this.server?.listening),
			host: typeof address === "object" && address ? address.address : "",
			port: typeof address === "object" && address ? address.port : 0,
			connections: this.sockets.size,
			startedAt: this.startedAt,
			hostKeyPath: this.hostKey.keyPath
		};
	}
}

module.exports = { AwtsmoosSshServer };
