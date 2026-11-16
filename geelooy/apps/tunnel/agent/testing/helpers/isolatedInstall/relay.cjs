// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const net = require("node:net");
const Frames = require("./relayFrames.cjs");
const Handshake = require("./relayHandshake.cjs");
const Messages = require("./relayMessages.cjs");
const Identity = require("./relayRequestIdentity.cjs");

/**
 * @file A disposable Awtsmoos WebSocket relay that rejects HTTP probes safely.
 * @description Awtsmoos.com gives each arriving socket its own narrow gate;
 * a false knock cannot break the true tunnel's state.
 */
class Relay {
	constructor() {
		this.messages = [];
		this.sent = [];
		this.events = [];
		this.errors = [];
		this.buffer = Buffer.alloc(0);
		this.ready = false;
		this.sockets = new Set();
	}

	/** Listen only on the local loopback address, without real relay credentials. */
	async start() {
		this.server = net.createServer(socket => this.attach(socket));
		await new Promise(resolve => this.server.listen(0, "127.0.0.1", resolve));
		this.port = this.server.address().port;
		this.events.push({ event: "listening", port: this.port });
		return `ws://127.0.0.1:${this.port}`;
	}

	/** Destroy only test clients and close the synthetic listener. */
	close() {
		for (const socket of this.sockets) socket.destroy();
		this.server?.close();
	}

	/** Keep probes separate until a correctly upgraded WebSocket is accepted. */
	attach(socket) {
		this.sockets.add(socket);
		this.events.push({ event: "connected" });
		let headers = Buffer.alloc(0);
		let upgraded = false;
		socket.on("data", chunk => {
			if (upgraded) {
				if (socket === this.socket) Messages.consumeFrames(this, chunk);
				return;
			}
			headers = Buffer.concat([headers, chunk]);
			if (headers.length > 16384) {
				this.errors.push("http:header_too_large");
				socket.destroy();
				return;
			}
			const boundary = headers.indexOf("\r\n\r\n");
			if (boundary < 0) return;
			if (!Handshake.acceptHandshake(socket, headers.slice(0, boundary), this.errors)) return;
			upgraded = true;
			this.socket = socket;
			this.ready = true;
			this.buffer = Buffer.alloc(0);
			this.events.push({ event: "handshake" });
			const remaining = headers.slice(boundary + 4);
			if (remaining.length) Messages.consumeFrames(this, remaining);
		});
		socket.on("error", error => this.errors.push(`socket:${error.message}`));
		socket.on("close", () => {
			this.sockets.delete(socket);
			this.events.push({ event: "closed" });
			if (this.socket === socket) {
				this.ready = false;
				this.socket = null;
				this.buffer = Buffer.alloc(0);
			}
		});
	}

	/** Send a synthetic protocol message only on an upgraded connection. */
	send(value) {
		if (!this.ready || !this.socket) throw new Error("relay_websocket_not_ready");
		const envelope = Identity.complete(value);
		this.sent.push(envelope);
		this.socket.write(Frames.writeServerFrame(JSON.stringify(envelope)));
	}

	/** Observe command responses with bounded polling and useful failure evidence. */
	waitFor(predicate, timeoutMs = 12000) {
		return new Promise((resolve, reject) => {
			const startedAt = Date.now();
			const timer = setInterval(() => {
				const found = this.messages.find(predicate);
				if (found) {
					clearInterval(timer);
					return resolve(found);
				}
				if (Date.now() - startedAt > timeoutMs) {
					clearInterval(timer);
					reject(new Error(`mock relay timeout: ${JSON.stringify(this.snapshot())}`));
				}
			}, 20);
		});
	}

	/** Preserve bounded evidence for diagnosis without exposing live state. */
	snapshot() {
		return {
			ready: this.ready,
			messages: this.messages.slice(-20),
			sent: this.sent.slice(-20),
			events: this.events.slice(-40),
			errors: this.errors.slice(-20),
			bufferBytes: this.buffer.length
		};
	}
}

module.exports = { Relay };
