// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Session = require("./clientSession.js");
const Limits = require("./frameLimits.js");

/**
 * B"H
 *
 * An incomplete legacy-sized frame may accumulate without tearing down the
 * tunnel, while one declared byte beyond the explicit contract closes only the
 * offending session and leaves the server process intact.
 */
const server = {
	removeClient() {}
};
const acceptedSocket = socket();
const acceptedClient = Session.createSocketClient(acceptedSocket);
const legacyBytes = 8 * 1024 * 1024;
const partial = declaredFramePrefix(legacyBytes, 1024);
Session.processClientBuffer(server, acceptedClient, partial);

assert.equal(acceptedSocket.ended, false);
assert.equal(acceptedClient.buffer.length, partial.length);
assert.equal(Session.MAXIMUM_BUFFER_BYTES > legacyBytes, true);

const rejectedSocket = socket();
const rejectedClient = Session.createSocketClient(rejectedSocket);
const oversizedHeader = declaredFramePrefix(
	Limits.maximumPayloadBytes() + 1,
	0
);
Session.processClientBuffer(server, rejectedClient, oversizedHeader);

assert.equal(rejectedSocket.ended, true);
assert.match(
	rejectedClient.lastTransportError,
	/websocket_payload_exceeds_limit/
);

console.log(JSON.stringify({
	ok: true,
	suite: "large-frame-session",
	acceptedDeclaredBytes: legacyBytes,
	rejectedDeclaredBytes: Limits.maximumPayloadBytes() + 1
}, null, 2));

function declaredFramePrefix(payloadBytes, includedPayloadBytes) {
	const header = Buffer.alloc(14);
	header[0] = 0x82;
	header[1] = 0xff;
	header.writeBigUInt64BE(BigInt(payloadBytes), 2);
	header.writeUInt32BE(0x12345678, 10);
	return Buffer.concat([
		header,
		Buffer.alloc(includedPayloadBytes)
	]);
}

function socket() {
	return {
		ended: false,
		writable: true,
		end() {
			this.ended = true;
		},
		write() {},
		on() {}
	};
}
