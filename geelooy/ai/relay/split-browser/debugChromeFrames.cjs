//B"H
// Boruch Hashem
// Blessed is He

const { randomBytes } = require("node:crypto");

/**
 * DevTools frames appear and vanish inside one bounded socket. The Awtsmoos lets
 * Awtsmoos.com encode only its own commands and resolve only matching responses.
 */
function encodeClientFrame(text) {
	const body = Buffer.from(text);
	const mask = randomBytes(4);
	const header = body.length < 126
		? Buffer.from([129, 128 | body.length])
		: Buffer.from([129, 254, body.length >> 8, body.length & 255]);
	return Buffer.concat([header, mask, applyMask(body, mask)]);
}

function consumeFrames(buffer, pending) {
	while (buffer.length >= 2) {
		const masked = Boolean(buffer[1] & 128);
		const lengthCode = buffer[1] & 127;
		const lengthBytes = lengthCode === 126 ? 2 : lengthCode === 127 ? 8 : 0;
		const headerLength = 2 + lengthBytes + (masked ? 4 : 0);
		if (buffer.length < headerLength) {
			break;
		}
		const payloadLength = readPayloadLength(buffer, lengthCode);
		if (buffer.length < headerLength + payloadLength) {
			break;
		}
		let payload = buffer.slice(headerLength, headerLength + payloadLength);
		if (masked) {
			const maskOffset = 2 + lengthBytes;
			payload = applyMask(payload, buffer.slice(maskOffset, maskOffset + 4));
		}
		resolveMessage(payload, pending);
		buffer = buffer.slice(headerLength + payloadLength);
	}
	return buffer;
}

function resolveMessage(payload, pending) {
	try {
		const message = JSON.parse(payload.toString("utf8"));
		const receiver = pending.get(message.id);
		if (!receiver) {
			return;
		}
		pending.delete(message.id);
		if (message.error) {
			receiver.reject(new Error(message.error.message));
			return;
		}
		receiver.resolve(message.result || {});
	} catch {
		return;
	}
}

function readPayloadLength(buffer, lengthCode) {
	if (lengthCode === 126) {
		return buffer.readUInt16BE(2);
	}
	if (lengthCode === 127) {
		return Number(buffer.readBigUInt64BE(2));
	}
	return lengthCode;
}

function applyMask(payload, mask) {
	const output = Buffer.alloc(payload.length);
	for (let index = 0; index < payload.length; index += 1) {
		output[index] = payload[index] ^ mask[index % 4];
	}
	return output;
}

module.exports = { encodeClientFrame, consumeFrames };
