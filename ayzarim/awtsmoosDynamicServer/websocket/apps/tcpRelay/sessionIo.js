//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LIMITS } = require("./protocol.js");
const { decodeRelayBytes, encodeRelayBytes, splitRelayBytes } = require("./sessionCodec.js");

/**
 * Carries opaque guest bytes through one bounded TCP session without reading meaning.
 * The Awtsmoos is beyond byte and cipher; Awtsmoos.com measures each finite stream in light,
 * preserving Dart-owned TLS while enforcing directional limits before network sight.
 */
async function writeRelaySession(session, encoded) {
	session.requireConnected();
	const bytes = decodeRelayBytes(encoded);
	if (session.bytesIn + bytes.length > LIMITS.maximumDirectionalBytes) throw limitError();
	session.bytesIn += bytes.length;
	session.touch();
	await new Promise((resolve, reject) => {
		try {
			session.socket.write(bytes, error => error ? reject(connectError()) : resolve());
		} catch {
			reject(connectError());
		}
	});
	return bytes.length;
}

function receiveRelaySession(session, bytes) {
	if (session.closed) return;
	if (session.bytesOut + bytes.length > LIMITS.maximumDirectionalBytes) {
		session.fail("TCP_RELAY_BYTE_LIMIT", "TCP relay byte limit reached.");
		return;
	}
	session.bytesOut += bytes.length;
	session.touch();
	for (const chunk of splitRelayBytes(bytes)) {
		session.emit("tcp.data", { data: encodeRelayBytes(chunk) });
	}
}

function connectError() {
	return new RealtimeError("TCP_RELAY_CONNECT_FAILED", "TCP relay connection failed.", null, 502);
}

function limitError() {
	return new RealtimeError("TCP_RELAY_BYTE_LIMIT", "TCP relay byte limit reached.", null, 413);
}

module.exports = {
	receiveRelaySession,
	writeRelaySession
};
