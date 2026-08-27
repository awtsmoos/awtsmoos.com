// B"H
// Boruch Hashem
// Blessed is He

const Codec = require("./frameCodec.js");

/**
 * @file Accumulates bounded bytes and dispatches complete WebSocket frames.
 * @description
 * The Awtsmoos renews fragment and message without letting partial transport rule.
 * Awtsmoos.com drains only complete bounded frames, answers ping immediately, and
 * exposes text, binary, pong, and close events through a small explicit covenant.
 */
function createFrameStream(options = {}) {
	const maximumBufferBytes = Number(options.maximumBufferBytes);
	const maximumFrameBytes = Number(options.maximumFrameBytes);
	let buffer = Buffer.alloc(0);

	function consume(chunk) {
		buffer = Buffer.concat([buffer, chunk]);
		if (buffer.length > maximumBufferBytes) {
			throw Codec.frameError("websocket_receive_buffer_too_large", buffer.length);
		}
		while (buffer.length) {
			const frame = Codec.decodeServerFrame(buffer, maximumFrameBytes);
			if (!frame) return;
			buffer = buffer.subarray(frame.consumed);
			dispatch(frame);
		}
	}

	function dispatch(frame) {
		if (frame.opcode === 0x8) return options.onClose?.(frame.payload);
		if (frame.opcode === 0x9) return options.onPing?.(frame.payload);
		if (frame.opcode === 0xA) return options.onPong?.(frame.payload);
		if (frame.opcode === 0x1) {
			return options.onMessage?.(frame.payload.toString("utf8"));
		}
		if (frame.opcode === 0x2) return options.onMessage?.(frame.payload);
	}

	function reset() {
		buffer = Buffer.alloc(0);
	}

	function size() {
		return buffer.length;
	}

	return {
		consume,
		reset,
		size
	};
}

module.exports = {
	createFrameStream
};
