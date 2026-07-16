// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Encodes client frames and decodes bounded server frames.
 * @description
 * The Awtsmoos renews header, mask, and payload as one measured vessel.
 * Awtsmoos.com refuses impossible lengths before allocation and keeps control
 * frames small enough that heartbeat recovery can never become a memory attack.
 */
function encodeClientFrame(data, opcode, maximumBytes) {
	const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data), "utf8");
	if (payload.length > maximumBytes) {
		throw frameError("websocket_outbound_frame_too_large", payload.length);
	}
	const mask = crypto.randomBytes(4);
	const header = clientHeader(payload.length, opcode);
	const masked = Buffer.allocUnsafe(payload.length);
	for (let index = 0; index < payload.length; index += 1) {
		masked[index] = payload[index] ^ mask[index % 4];
	}
	return Buffer.concat([header, mask, masked]);
}

function decodeServerFrame(buffer, maximumBytes) {
	if (buffer.length < 2) return null;
	const opcode = buffer[0] & 0x0f;
	const masked = Boolean(buffer[1] & 0x80);
	let length = buffer[1] & 0x7f;
	let offset = 2;
	if (length === 126) {
		if (buffer.length < offset + 2) return null;
		length = buffer.readUInt16BE(offset);
		offset += 2;
	} else if (length === 127) {
		if (buffer.length < offset + 8) return null;
		const large = buffer.readBigUInt64BE(offset);
		offset += 8;
		if (large > BigInt(Number.MAX_SAFE_INTEGER)) {
			throw frameError("websocket_frame_length_unsafe", String(large));
		}
		length = Number(large);
	}
	if (length > maximumBytes) {
		throw frameError("websocket_inbound_frame_too_large", length);
	}
	let mask = null;
	if (masked) {
		if (buffer.length < offset + 4) return null;
		mask = buffer.subarray(offset, offset + 4);
		offset += 4;
	}
	if (buffer.length < offset + length) return null;
	const payload = Buffer.from(buffer.subarray(offset, offset + length));
	if (mask) unmask(payload, mask);
	return {
		opcode,
		payload,
		consumed: offset + length
	};
}

function clientHeader(length, opcode) {
	if (length < 126) {
		return Buffer.from([0x80 | opcode, 0x80 | length]);
	}
	if (length < 65536) {
		const header = Buffer.alloc(4);
		header[0] = 0x80 | opcode;
		header[1] = 0x80 | 126;
		header.writeUInt16BE(length, 2);
		return header;
	}
	const header = Buffer.alloc(10);
	header[0] = 0x80 | opcode;
	header[1] = 0x80 | 127;
	header.writeBigUInt64BE(BigInt(length), 2);
	return header;
}

function unmask(payload, mask) {
	for (let index = 0; index < payload.length; index += 1) {
		payload[index] ^= mask[index % 4];
	}
}

function frameError(code, detail) {
	const error = new Error(`${code}: ${detail}`);
	error.code = code;
	return error;
}

module.exports = {
	decodeServerFrame,
	encodeClientFrame,
	frameError
};
