// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./frameLimits.js");

/**
 * B"H
 *
 * Frame metadata is judged before payload allocation. The Awtsmoos renews
 * header and length; Awtsmoos.com accepts the established tunnel contract while
 * refusing any frame whose declared body exceeds the configured physical bound.
 */
function readFrame(buffer, options = {}) {
	if (!buffer || buffer.length < 2) {
		return null;
	}

	const byte0 = buffer[0];
	const byte1 = buffer[1];
	const fin = (byte0 & 0x80) === 0x80;
	const opcode = byte0 & 0x0f;
	const masked = (byte1 & 0x80) === 0x80;
	let payloadLength = byte1 & 0x7f;
	let offset = 2;

	if (payloadLength === 126) {
		if (buffer.length < offset + 2) {
			return null;
		}
		payloadLength = buffer.readUInt16BE(offset);
		offset += 2;
	} else if (payloadLength === 127) {
		if (buffer.length < offset + 8) {
			return null;
		}
		const declared = buffer.readBigUInt64BE(offset);
		offset += 8;
		if (declared > BigInt(Number.MAX_SAFE_INTEGER)) {
			throw new Error("websocket_payload_exceeds_numeric_range");
		}
		payloadLength = Number(declared);
	}

	const maximumPayloadBytes = Number(
		options.maximumPayloadBytes ?? Limits.maximumPayloadBytes()
	);
	if (payloadLength > maximumPayloadBytes) {
		throw new Error(
			`websocket_payload_exceeds_limit:${payloadLength}:${maximumPayloadBytes}`
		);
	}

	let mask = null;
	if (masked) {
		if (buffer.length < offset + 4) {
			return null;
		}
		mask = buffer.subarray(offset, offset + 4);
		offset += 4;
	}
	if (buffer.length < offset + payloadLength) {
		return null;
	}

	const payload = Buffer.from(
		buffer.subarray(offset, offset + payloadLength)
	);
	if (masked && mask) {
		for (let index = 0; index < payload.length; index += 1) {
			payload[index] ^= mask[index % 4];
		}
	}

	return {
		consumed: offset + payloadLength,
		frame: {
			fin,
			opcode,
			masked,
			payload
		}
	};
}

module.exports = {
	readFrame
};
