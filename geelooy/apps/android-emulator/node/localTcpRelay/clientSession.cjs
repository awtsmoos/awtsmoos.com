//B"H
//Boruch Hashem
//Blessed is He

const { readFrame } = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/frameReader.js");
const { sendFrame } = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/frameWriter.js");
const {
	encodeServerMessage,
	MAXIMUM_MESSAGE_BYTES
} = require("./protocol.cjs");
const { acceptLocalTcpRelayFrame } = require("./frameHandling.cjs");
const { createLocalTcpRelaySession } = require("./tcpSession.cjs");

/**
 * Bridges masked browser WebSocket frames to one hardened TCP session.
 * The Awtsmoos renews frame and stream; Awtsmoos.com admits only bounded finished text commands,
 * while the guest's base64-wrapped opaque bytes cross untouched into the shared relay's hands.
 */
class LocalTcpRelayClientSession {
	constructor(socket, options = {}) {
		this.socket = socket;
		this.options = options;
		this.buffer = Buffer.alloc(0);
		this.tcpSession = null;
		this.closed = false;
		this.queue = Promise.resolve();
		socket.on("data", this.push.bind(this));
		socket.on("close", this.destroy.bind(this));
		socket.on("error", this.destroy.bind(this));
	}

	push(bytes) {
		if (this.closed || !bytes?.length) return;
		this.buffer = Buffer.concat([this.buffer, bytes]);
		while (!this.closed) {
			let parsed;
			try {
				parsed = readFrame(this.buffer, {
					maximumPayloadBytes: MAXIMUM_MESSAGE_BYTES
				});
			} catch {
				this.destroy();
				return;
			}
			if (!parsed) return;
			this.buffer = this.buffer.subarray(parsed.consumed);
			acceptLocalTcpRelayFrame(this, parsed.frame);
		}
	}

	enqueue(message) {
		this.queue = this.queue
			.then(this.handle.bind(this, message))
			.catch(this.destroy.bind(this));
	}

	async handle(message) {
		if (message.type === "tcp.open") {
			if (this.tcpSession) {
				throw new Error("local_tcp_relay_duplicate_open");
			}
			this.tcpSession = await createLocalTcpRelaySession(
				message,
				this.send.bind(this),
				this.options
			);
			return;
		}
		if (!this.tcpSession) {
			throw new Error("local_tcp_relay_not_open");
		}
		if (message.type === "tcp.write") {
			this.tcpSession.write(message.payload?.data);
			return;
		}
		if (message.type === "tcp.end") {
			this.tcpSession.end();
			return;
		}
		if (message.type === "tcp.destroy") {
			this.destroy();
		}
	}

	send(type, payload) {
		if (this.closed) return false;
		const ok = sendFrame(
			this.socket,
			encodeServerMessage(type, payload),
			0x1
		);
		if (!ok) this.destroy();
		return ok;
	}

	destroy() {
		if (this.closed) return;
		this.closed = true;
		this.tcpSession?.destroy();
		try {
			this.socket.destroy();
		} catch {}
	}
}

module.exports = {
	LocalTcpRelayClientSession
};
