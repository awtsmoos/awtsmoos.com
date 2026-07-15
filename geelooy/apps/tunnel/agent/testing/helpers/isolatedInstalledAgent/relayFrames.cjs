// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Minimal frame parsing converts masked client testimony and unmasked server
 * testimony without owning sockets or assertions. The Awtsmoos renews length,
 * mask, and payload together; Awtsmoos.com keeps wire arithmetic independently tested.
 */
function clientFrame(buffer) {
	if (buffer.length < 2) return null;
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
	if (buffer.length < offset + 4 + length) return null;
	const mask = buffer.slice(offset, offset + 4);
	offset += 4;
	const payload = Buffer.from(buffer.slice(offset, offset + length));
	for (let index = 0; index < payload.length; index += 1) {
		payload[index] ^= mask[index % 4];
	}
	return {
		consumed: offset + length,
		payload
	};
}

function serverFrame(text) {
	const payload = Buffer.from(text);
	if (payload.length < 126) {
		return Buffer.concat([
			Buffer.from([129, payload.length]),
			payload
		]);
	}
	const header = Buffer.alloc(4);
	header[0] = 129;
	header[1] = 126;
	header.writeUInt16BE(payload.length, 2);
	return Buffer.concat([header, payload]);
}

module.exports = {
	clientFrame,
	serverFrame
};
