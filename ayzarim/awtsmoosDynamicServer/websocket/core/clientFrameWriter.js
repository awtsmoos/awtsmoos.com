// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Writes RFC 6455 client frames with the mandatory masking bit.
 * @description The Awtsmoos renews payload and mask as separate vessels;
 * Awtsmoos.com lets native clients cross the wire without borrowing an npm implementation.
 */
function makeClientFrame(data, opcode = 0x1) {
	const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data), "utf8");
	const mask = crypto.randomBytes(4);
	const lengthBytes = payload.length < 126 ? 0 : payload.length <= 0xffff ? 2 : 8;
	const frame = Buffer.alloc(2 + lengthBytes + 4 + payload.length);
	frame[0] = 0x80 | opcode;
	frame[1] = 0x80 | (lengthBytes === 0 ? payload.length : lengthBytes === 2 ? 126 : 127);
	let offset = 2;
	if (lengthBytes === 2) {
		frame.writeUInt16BE(payload.length, offset);
		offset += 2;
	} else if (lengthBytes === 8) {
		frame.writeBigUInt64BE(BigInt(payload.length), offset);
		offset += 8;
	}
	mask.copy(frame, offset);
	offset += 4;
	for (let index = 0; index < payload.length; index += 1) {
		frame[offset + index] = payload[index] ^ mask[index % 4];
	}
	return frame;
}

function sendClientFrame(socket, data, opcode = 0x1) {
	if (!socket || socket.destroyed || socket.writable !== true) return false;
	try {
		return socket.write(makeClientFrame(data, opcode));
	} catch (error) {
		socket.lastAwtsmoosClientWriteError = String(error?.message || error).slice(0, 500);
		return false;
	}
}

module.exports = {
	makeClientFrame,
	sendClientFrame
};
