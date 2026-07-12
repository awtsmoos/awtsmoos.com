// B"H

/** B"H — WebSocket frames are decoded completely before mock-relay judgment. */
function readClientFrame(buffer) {
	if (buffer.length < 2) return null;
	const opcode = buffer[0] & 15;
	const masked = Boolean(buffer[1] & 128);
	let length = buffer[1] & 127;
	let offset = 2;
	if (length === 126) {
		if (buffer.length < 4) return null;
		length = buffer.readUInt16BE(2);
		offset = 4;
	}
	if (length === 127) {
		if (buffer.length < 10) return null;
		length = Number(buffer.readBigUInt64BE(2));
		offset = 10;
	}
	let mask = null;
	if (masked) {
		if (buffer.length < offset + 4) return null;
		mask = buffer.subarray(offset, offset + 4);
		offset += 4;
	}
	if (buffer.length < offset + length) return null;
	const payload = Buffer.from(buffer.subarray(offset, offset + length));
	if (mask) {
		for (let index = 0; index < payload.length; index += 1) {
			payload[index] ^= mask[index % 4];
		}
	}
	return { opcode, payload, consumed: offset + length };
}

function writeServerFrame(text) {
	const payload = Buffer.from(text);
	if (payload.length < 126) {
		return Buffer.concat([Buffer.from([129, payload.length]), payload]);
	}
	if (payload.length < 65536) {
		const header = Buffer.alloc(4);
		header[0] = 129;
		header[1] = 126;
		header.writeUInt16BE(payload.length, 2);
		return Buffer.concat([header, payload]);
	}
	const header = Buffer.alloc(10);
	header[0] = 129;
	header[1] = 127;
	header.writeBigUInt64BE(BigInt(payload.length), 2);
	return Buffer.concat([header, payload]);
}

module.exports = { readClientFrame, writeServerFrame };
