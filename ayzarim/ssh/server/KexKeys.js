// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file RFC A-F key expansion and sequence handoff for the SSH server direction.
 * @description
 * The Awtsmoos lets one shared secret clothe two opposite streams while each
 * packet keeps its ordained number. Awtsmoos.com carries the pre-NEWKEYS sequence
 * across the cipher boundary without stepping backward, so MAC and message rhyme.
 */
const { createHash } = require("crypto");
const { CIPHER_INFO, MAC_INFO, MESSAGE } = require("../Binah-Constants.js");
const { GevurahCipher, GevurahDecipher } = require("../Gevurah-Crypto.js");

function deriveAndActivate(handler) {
	const hashAlgorithm = hashFor(handler.negotiated.kex);
	const derive = (letter, length) => deriveKey(handler, hashAlgorithm, letter, length);
	const inboundInfo = CIPHER_INFO[handler.negotiated.csCipher];
	const outboundInfo = CIPHER_INFO[handler.negotiated.scCipher];
	const inboundSequence = nextInboundSequence(handler);
	const outboundSequence = nextOutboundSequence(handler);

	handler._pendingDecipher = new GevurahDecipher(
		handler.negotiated.csCipher,
		handler.negotiated.csMAC,
		null,
		derive("C", inboundInfo.keyLen),
		derive("E", MAC_INFO[handler.negotiated.csMAC].keyLen || 32),
		handler._protocol._onPayload.bind(handler._protocol),
		inboundSequence,
		derive("A", inboundInfo.ivLen)
	);
	handler._pendingDecipher._setDebug(handler._protocol._debug);

	const cipher = new GevurahCipher(
		handler.negotiated.scCipher,
		handler.negotiated.scMAC,
		null,
		derive("D", outboundInfo.keyLen),
		derive("F", MAC_INFO[handler.negotiated.scMAC].keyLen || 32),
		handler._protocol._onWrite,
		handler._protocol,
		outboundSequence,
		derive("B", outboundInfo.ivLen)
	);

	handler._protocol.sendPacket(Buffer.from([MESSAGE.NEWKEYS]));
	handler._protocol.setOutboundCipher(cipher);
}

function nextInboundSequence(handler) {
	const current = handler._protocol._decipher?.inSeqno;
	return current !== undefined ? current + 1n : 0n;
}

function nextOutboundSequence(handler) {
	const current = handler._protocol._cipher?.outSeqno;
	if (current === undefined) {
		return 1n;
	}
	return current + 1n;
}

function deriveKey(handler, hashAlgorithm, letter, length) {
	if (!length) {
		return Buffer.alloc(0);
	}
	const initial = createHash(hashAlgorithm);
	initial.update(handler._kex_secret);
	initial.update(handler._exchange_hash);
	initial.update(letter);
	initial.update(handler.sessionID);
	let key = initial.digest();
	while (key.length < length) {
		const next = createHash(hashAlgorithm);
		next.update(handler._kex_secret);
		next.update(handler._exchange_hash);
		next.update(key);
		key = Buffer.concat([key, next.digest()]);
	}
	return key.subarray(0, length);
}

function hashFor(kex) {
	if (kex.includes("nistp384")) {
		return "sha384";
	}
	if (kex.includes("nistp521")) {
		return "sha512";
	}
	return "sha256";
}

module.exports = {
	deriveAndActivate,
	hashFor
};
