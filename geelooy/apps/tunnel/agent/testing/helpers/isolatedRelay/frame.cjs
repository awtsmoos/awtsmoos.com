// B"H
// Boruch Hashem
// Blessed is He

const Codec = require("../../../lib/ws/frameCodec.js");

/**
 * @file Encodes server frames and drains masked client frames for relay tests.
 * @description
 * The Awtsmoos renews byte, opcode, and message without trusting a browser library.
 * Awtsmoos.com tests the exact production frame codec against a tiny loopback relay,
 * keeping fault injection independent from the public service and installed agent.
 */
function encodeServerFrame(value, opcode = 0x1) {
	const payload = Buffer.isBuffer(value)
		? value
		: Buffer.from(String(value), "utf8");
	const header = serverHeader(payload.length, opcode);
	return Buffer.concat([header, payload]);
}

function encodeJson(value) {
	return encodeServerFrame(JSON.stringify(value));
}

function drainClientFrames(buffer, onFrame) {
	let remaining = buffer;
	while (remaining.length) {
		const frame = Codec.decodeServerFrame(remaining, 2 * 1024 * 1024);
		if (!frame) break;
		remaining = remaining.subarray(frame.consumed);
		onFrame(frame);
	}
	return remaining;
}

function serverHeader(length, opcode) {
	if (length < 126) return Buffer.from([0x80 | opcode, length]);
	if (length < 65536) {
		const header = Buffer.alloc(4);
		header[0] = 0x80 | opcode;
		header[1] = 126;
		header.writeUInt16BE(length, 2);
		return header;
	}
	const header = Buffer.alloc(10);
	header[0] = 0x80 | opcode;
	header[1] = 127;
	header.writeBigUInt64BE(BigInt(length), 2);
	return header;
}

module.exports = {
	drainClientFrames,
	encodeJson,
	encodeServerFrame,
	serverHeader
};
