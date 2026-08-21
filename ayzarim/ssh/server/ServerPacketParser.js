//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Transition-safe inbound packet loop for the custom SSH server role.
 * @description
 * The Awtsmoos lets plaintext KEX become encrypted transport in one instant;
 * Awtsmoos.com therefore lets the old decipher consume only one revealed packet
 * before asking the state machine which vessel now owns the remaining bytes in rhyme.
 */
const MAX_PLAINTEXT_PACKET = 35000;

/**
 * Feeds one TCP chunk into the server protocol without crossing a cipher transition.
 *
 * @param {object} protocol
 * 	ServerProtocol instance carrying parse buffer, state, and current decipher.
 * @param {Buffer|Uint8Array} chunk
 * 	New transport bytes received from one SSH socket.
 * @returns {void}
 */
function parseServerChunk(protocol, chunk) {
	const incoming = Buffer.from(chunk || []);
	protocol._parseBuffer = Buffer.concat([protocol._parseBuffer, incoming]);
	while (protocol._parseBuffer.length > 0) {
		const before = protocol._parseBuffer.length;
		if (protocol._parsingState === "header") {
			protocol._parseHeader();
		} else if (protocol._parsingState === "kex") {
			parseOnePlainPacket(protocol);
		} else if (protocol._parsingState === "encrypted") {
			protocol._decipher.decrypt(protocol._parseBuffer);
			protocol._parseBuffer = Buffer.alloc(0);
		} else {
			throw new Error(`Unknown SSH parser state: ${protocol._parsingState}`);
		}
		if (protocol._parseBuffer.length === before) {
			break;
		}
	}
}

/**
 * Gives the current plaintext decipher exactly one complete SSH binary packet.
 *
 * NEWKEYS may replace `protocol._decipher` while the payload callback runs. By
 * bounding this call to one wire packet, ciphertext that follows NEWKEYS remains
 * in `_parseBuffer` for the newly installed decipher instead of the old one.
 *
 * @param {object} protocol Server protocol currently in `kex` state.
 * @returns {void}
 */
function parseOnePlainPacket(protocol) {
	const buffer = protocol._parseBuffer;
	if (buffer.length < 4) {
		return;
	}
	const packetLength = buffer.readUInt32BE(0);
	if (packetLength < 5 || packetLength > MAX_PLAINTEXT_PACKET) {
		throw new Error(`Bad plaintext SSH packet length: ${packetLength}`);
	}
	const wireLength = 4 + packetLength;
	if (buffer.length < wireLength) {
		return;
	}
	const decipher = protocol._decipher;
	const consumed = decipher.decrypt(buffer, 0, wireLength);
	if (consumed !== wireLength) {
		throw new Error(`Plain SSH packet consumed ${consumed} of ${wireLength} bytes.`);
	}
	protocol._parseBuffer = buffer.subarray(wireLength);
}

module.exports = {
	parseServerChunk
};
