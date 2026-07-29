//B"H
//Boruch Hashem
//Blessed is He

/**
 * A browser close frame deserves a protocol reply before transport destruction. The
 * Awtsmoos renews connection and separation; Awtsmoos.com flushes the close reply,
 * then guarantees the socket close event that reaches every application disconnect hook.
 */

const { makeHeader } = require('./frameWriter.js');

const MAXIMUM_REASON_BYTES = 123;

/** Replies once with the client's close payload, then destroys after bytes flush. */
function completeCloseHandshake(client, payload = Buffer.alloc(0)) {
	if (client.closeAcknowledged) {
		return false;
	}
	client.closeAcknowledged = true;
	const safePayload = Buffer.isBuffer(payload) ? payload.subarray(0, 125) : Buffer.alloc(0);
	const frame = Buffer.concat([makeHeader(safePayload.length, 0x8), safePayload]);
	try {
		if (!client.socket.writable) {
			client.socket.destroy?.();
			return false;
		}
		client.socket.end(frame, () => {
			client.socket.destroy?.();
		});
		return true;
	} catch (error) {
		client.lastTransportError = `close_handshake_error:${error.message}`;
		client.socket.destroy?.();
		return false;
	}
}

/** Sends one server-originated RFC 6455 close code and bounded reason. */
function initiateCloseHandshake(client, code = 1000, reason = '') {
	if (client.closeAcknowledged) return false;
	client.closeAcknowledged = true;
	const reasonBytes = Buffer.from(String(reason || ''), 'utf8').subarray(0, MAXIMUM_REASON_BYTES);
	const payload = Buffer.alloc(2 + reasonBytes.length);
	payload.writeUInt16BE(Number(code || 1000), 0);
	reasonBytes.copy(payload, 2);
	const frame = Buffer.concat([makeHeader(payload.length, 0x8), payload]);
	try {
		if (!client.socket.writable) {
			client.socket.destroy?.();
			return false;
		}
		client.socket.end(frame, () => client.socket.destroy?.());
		return true;
	} catch (error) {
		client.lastTransportError = `close_initiation_error:${error.message}`;
		client.socket.destroy?.();
		return false;
	}
}

module.exports = {
	MAXIMUM_REASON_BYTES,
	completeCloseHandshake,
	initiateCloseHandshake
};
