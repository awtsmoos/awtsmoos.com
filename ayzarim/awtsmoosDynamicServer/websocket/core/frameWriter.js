// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_MAXIMUM_QUEUED_BYTES = 64 * 1024 * 1024;

/**
 * @file Writes complete WebSocket frames without duplicating large payloads.
 * @description
 * The Awtsmoos keeps header, payload, and socket pressure measured separately.
 * Awtsmoos.com accepts normal kernel backpressure but refuses an unbounded
 * user-space queue that could freeze every tunnel behind one slow connection.
 */
function makeHeader(length, opcode) {
	if (length < 126) return Buffer.from([0x80 | opcode, length]);

	if (length <= 0xffff) {
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

function maximumQueuedBytes(environment = process.env) {
	const configured = Number(environment.AWTSMOOS_WS_MAX_QUEUED_WRITE_BYTES);
	if (!Number.isFinite(configured)) return DEFAULT_MAXIMUM_QUEUED_BYTES;
	return Math.max(1024 * 1024, Math.min(512 * 1024 * 1024, Math.floor(configured)));
}

function sendFrame(socket, data, opcode = 0x1, options = {}) {
	const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data), "utf8");
	const header = makeHeader(payload.length, opcode);
	const queuedBytes = Number(socket?.writableLength || 0);
	const limit = Number(options.maximumQueuedBytes || maximumQueuedBytes());
	const frameBytes = header.length + payload.length;

	if (!socket || socket.destroyed || socket.writable !== true) return false;
	if (queuedBytes + frameBytes > limit) {
		socket.awtsmoosBackpressure = {
			at: Date.now(),
			frameBytes,
			limit,
			queuedBytes
		};
		return false;
	}

	try {
		socket.cork?.();
		socket.write(header);
		if (payload.length) socket.write(payload);
		socket.uncork?.();
		return true;
	} catch (error) {
		try { socket.uncork?.(); } catch {}
		socket.lastAwtsmoosWriteError = String(error?.message || error).slice(0, 500);
		return false;
	}
}

module.exports = {
	DEFAULT_MAXIMUM_QUEUED_BYTES,
	makeHeader,
	maximumQueuedBytes,
	sendFrame
};
