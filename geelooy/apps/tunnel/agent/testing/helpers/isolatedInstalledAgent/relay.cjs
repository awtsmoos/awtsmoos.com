// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const net = require("node:net");
const Frames = require("./relayFrames.cjs");

/**
 * B"H
 *
 * The relay witnesses registration and correlated responses from the extracted
 * agent. The Awtsmoos renews socket and message together; Awtsmoos.com keeps frame
 * arithmetic outside this transport vessel so each module remains small and clear.
 */
class Relay {
	constructor() {
		this.messages = [];
		this.buffer = Buffer.alloc(0);
		this.ready = false;
	}

	async start() {
		this.server = net.createServer(socket => this.attach(socket));
		await new Promise(resolve => {
			this.server.listen(0, "127.0.0.1", resolve);
		});
		return `ws://127.0.0.1:${this.server.address().port}`;
	}

	close() {
		try {
			this.socket?.destroy();
		} catch {}
		try {
			this.server?.close();
		} catch {}
	}

	attach(socket) {
		this.socket = socket;
		let handshake = Buffer.alloc(0);
		socket.on("data", chunk => {
			if (this.ready) return this.consumeFrames(chunk);
			handshake = Buffer.concat([handshake, chunk]);
			const end = handshake.indexOf("\r\n\r\n");
			if (end < 0) return;
			this.acceptHandshake(socket, handshake.slice(0, end));
			this.ready = true;
			const remainder = handshake.slice(end + 4);
			if (remainder.length) this.consumeFrames(remainder);
		});
	}

	acceptHandshake(socket, header) {
		const key = /Sec-WebSocket-Key:\s*(.+)/i
			.exec(header.toString("utf8"))[1]
			.trim();
		const accept = crypto.createHash("sha1")
			.update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
			.digest("base64");
		socket.write([
			"HTTP/1.1 101 Switching Protocols",
			"Upgrade: websocket",
			"Connection: Upgrade",
			`Sec-WebSocket-Accept: ${accept}`,
			"",
			""
		].join("\r\n"));
	}

	consumeFrames(chunk) {
		this.buffer = Buffer.concat([this.buffer, chunk]);
		while (true) {
			const frame = Frames.clientFrame(this.buffer);
			if (!frame) return;
			this.buffer = this.buffer.slice(frame.consumed);
			this.messages.push(JSON.parse(frame.payload.toString("utf8")));
		}
	}

	send(value) {
		this.socket.write(Frames.serverFrame(JSON.stringify(value)));
	}

	waitFor(predicate, timeoutMs = 15000) {
		return new Promise((resolve, reject) => {
			const startedAt = Date.now();
			const timer = setInterval(() => {
				const message = this.messages.find(predicate);
				if (message) {
					clearInterval(timer);
					return resolve(message);
				}
				if (Date.now() - startedAt > timeoutMs) {
					clearInterval(timer);
					reject(new Error("mock_relay_timeout"));
				}
			}, 20);
		});
	}
}

module.exports = {
	Relay
};
