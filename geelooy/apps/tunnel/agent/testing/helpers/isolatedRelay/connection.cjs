// B"H
// Boruch Hashem
// Blessed is He

const EventEmitter = require("node:events");
const Handshake = require("../../../lib/ws/handshake.js");
const Frames = require("./frame.cjs");

/**
 * @file Represents one loopback relay-side WebSocket connection.
 * @description
 * The Awtsmoos renews handshake and message without borrowing production service.
 * Awtsmoos.com may answer pings, become deliberately silent, or destroy the socket,
 * allowing the real agent source to reveal whether each fault heals by itself.
 */
class RelayConnection extends EventEmitter {
	constructor(socket, sequence) {
		super();
		this.socket = socket;
		this.sequence = sequence;
		this.requestBuffer = Buffer.alloc(0);
		this.frameBuffer = Buffer.alloc(0);
		this.upgraded = false;
		this.respondToPing = true;
		this.closed = false;
		socket.on("data", chunk => this.consume(chunk));
		socket.once("close", () => this.finish());
		socket.once("error", error => this.emit("socketError", error));
	}

	consume(chunk) {
		if (!this.upgraded) return this.consumeHandshake(chunk);
		this.consumeFrames(chunk);
	}

	consumeHandshake(chunk) {
		this.requestBuffer = Buffer.concat([this.requestBuffer, chunk]);
		const end = this.requestBuffer.indexOf("\r\n\r\n");
		if (end === -1) return;
		const request = this.requestBuffer.subarray(0, end + 4).toString("utf8");
		const rest = this.requestBuffer.subarray(end + 4);
		const key = request.match(/Sec-WebSocket-Key:\s*([^\r\n]+)/i)?.[1]?.trim();
		if (!key) return this.socket.destroy(new Error("missing_websocket_key"));
		this.socket.write(upgradeResponse(key));
		this.requestBuffer = Buffer.alloc(0);
		this.upgraded = true;
		this.emit("open", { request });
		if (rest.length) this.consumeFrames(rest);
	}

	consumeFrames(chunk) {
		this.frameBuffer = Buffer.concat([this.frameBuffer, chunk]);
		this.frameBuffer = Frames.drainClientFrames(this.frameBuffer, frame => {
			if (frame.opcode === 0x9) {
				this.emit("ping", frame.payload);
				if (this.respondToPing) this.sendFrame(frame.payload, 0xA);
				return;
			}
			if (frame.opcode === 0x8) return this.socket.end();
			if (frame.opcode !== 0x1 && frame.opcode !== 0x2) return;
			const raw = frame.opcode === 0x1
				? frame.payload.toString("utf8")
				: frame.payload;
			this.emit("message", parseJson(raw), raw);
		});
	}

	sendJson(value) {
		return this.socket.write(Frames.encodeJson(value));
	}

	sendFrame(value, opcode) {
		return this.socket.write(Frames.encodeServerFrame(value, opcode));
	}

	destroy() {
		this.socket.destroy();
	}

	finish() {
		if (this.closed) return;
		this.closed = true;
		this.emit("close");
	}
}

function upgradeResponse(key) {
	return [
		"HTTP/1.1 101 Switching Protocols",
		"Upgrade: websocket",
		"Connection: Upgrade",
		`Sec-WebSocket-Accept: ${Handshake.expectedAccept(key)}`,
		"",
		""
	].join("\r\n");
}

function parseJson(raw) {
	try { return JSON.parse(String(raw)); } catch { return null; }
}

module.exports = {
	RelayConnection,
	parseJson,
	upgradeResponse
};
