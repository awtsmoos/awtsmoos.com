// B"H
// Boruch Hashem
// Blessed is He

const EventEmitter = require("node:events");
const { URL } = require("node:url");
const Handshake = require("./handshake.js");
const SocketFactory = require("./socketFactory.js");
const Liveness = require("./transportLiveness.js");
const Support = require("./clientSupport.js");
const Lifecycle = require("./clientLifecycle.js");

/**
 * @file Owns one self-healing WebSocket generation.
 * @description
 * The Awtsmoos renews socket, verified handshake, ping, and closing as one vessel.
 * Awtsmoos.com turns half-open silence and bounded protocol failure into explicit
 * close testimony so the outer runtime can create a healthier generation.
 */
class TinyWebSocket extends EventEmitter {
	constructor(address, options = {}) {
		super();
		this.address = address;
		this.options = options;
		this.limits = Support.limitsFromEnvironment();
		this.socket = null;
		this.opened = false;
		this.closed = false;
		this.handshaken = false;
		this.handshakeBuffer = Buffer.alloc(0);
		this.handshakeKey = "";
		this.handshakeTimer = null;
		this.frames = Support.createFrames(this, this.limits);
		this.liveness = Liveness.createTransportLiveness({
			...options.liveness,
			onPing: () => this.ping(),
			onDead: ({ idleMs }) => this.fail(Support.socketError(
				"websocket_inbound_idle_timeout",
				`No inbound bytes for ${idleMs}ms.`
			))
		});
	}

	connect() {
		const url = new URL(this.address);
		if (!["ws:", "wss:"].includes(url.protocol)) {
			throw Support.socketError("unsupported_websocket_protocol", url.protocol);
		}
		this.socket = SocketFactory.createSocket(url, socket => {
			const request = Handshake.request(url);
			this.handshakeKey = request.key;
			socket.write(request.text);
		}, this.options);
		this.armHandshakeDeadline();
		this.socket.on("data", chunk => this.handleData(chunk));
		this.socket.once("close", () => this.finishClose());
		this.socket.once("end", () => this.finishClose());
		this.socket.once("error", error => this.fail(error));
		return this;
	}

	handleData(chunk) {
		if (this.closed) return;
		this.liveness.observeInbound();
		try {
			if (!this.handshaken) return this.handleHandshake(chunk);
			this.frames.consume(chunk);
		} catch (error) {
			this.fail(error);
		}
	}

	handleHandshake(chunk) {
		const result = Handshake.consume(
			this.handshakeBuffer,
			chunk,
			this.handshakeKey
		);
		if (!result.complete) {
			this.handshakeBuffer = result.buffer;
			return;
		}
		this.handshakeBuffer = Buffer.alloc(0);
		this.handshaken = true;
		this.opened = true;
		this.clearHandshakeDeadline();
		this.liveness.start();
		this.emit("open");
		if (result.rest.length) this.frames.consume(result.rest);
	}

	armHandshakeDeadline() {
		this.clearHandshakeDeadline();
		this.handshakeTimer = setTimeout(() => {
			this.fail(Support.socketError("websocket_handshake_timeout"));
		}, Handshake.timeoutMs(this.options.handshakeTimeoutMs));
		this.handshakeTimer.unref?.();
	}

	clearHandshakeDeadline() {
		if (this.handshakeTimer) clearTimeout(this.handshakeTimer);
		this.handshakeTimer = null;
	}

	sendFrame(data, opcode = 0x1) { return Lifecycle.sendFrame(this, data, opcode); }
	send(text) { return this.sendFrame(String(text), 0x1); }
	sendJson(value) { return this.send(JSON.stringify(value)); }
	ping(value = `awtsmoos:${Date.now()}`) { return this.sendFrame(value, 0x9); }
	fail(error) { return Lifecycle.fail(this, error); }
	close(force = false) { return Lifecycle.close(this, force); }
	finishClose() { return Lifecycle.finishClose(this); }
}

module.exports = { TinyWebSocket };
