// B"H

'use strict';

const { createHash } = require('crypto');
const { CIPHER_INFO, MAC_INFO, MESSAGE } = require('./Binah-Constants.js');
const { GevurahCipher, GevurahDecipher } = require('./Gevurah-Crypto.js');

function deriveKeysAndActivate() {
	const hashAlgorithm = algorithm(this.negotiated.kex);
	const derive = (letter, length) => deriveKey(this, hashAlgorithm, letter, length);
	const outbound = CIPHER_INFO[this.negotiated.csCipher];
	const inbound = CIPHER_INFO[this.negotiated.scCipher];
	const outboundIv = derive('A', outbound.ivLen);
	const inboundIv = derive('B', inbound.ivLen);
	const outboundKey = derive('C', outbound.keyLen);
	const inboundKey = derive('D', inbound.keyLen);
	const outboundMac = derive('E', MAC_INFO[this.negotiated.csMAC].keyLen || 32);
	const inboundMac = derive('F', MAC_INFO[this.negotiated.scMAC].keyLen || 32);
	const inboundSequence = this._protocol._decipher?.inSeqno !== undefined
		? this._protocol._decipher.inSeqno + 1n : 0n;
	this._pendingDecipher = new GevurahDecipher(
		this.negotiated.scCipher,
		this.negotiated.scMAC,
		null,
		inboundKey,
		inboundMac,
		this._protocol._onPayload.bind(this._protocol),
		inboundSequence,
		inboundIv
	);
	this._pendingDecipher._setDebug(this._protocol._debug);
	this._protocol.sendPacket(Buffer.from([MESSAGE.NEWKEYS]));
	const outboundSequence = this._protocol._cipher?.outSeqno ?? 0n;
	this._pendingCipher = new GevurahCipher(
		this.negotiated.csCipher,
		this.negotiated.csMAC,
		null,
		outboundKey,
		outboundMac,
		this._protocol._onWrite,
		this._protocol,
		outboundSequence,
		outboundIv
	);
	this._protocol.setOutboundCipher(this._pendingCipher);
	this._pendingCipher = null;
}

function deriveKey(handler, hashAlgorithm, letter, length) {
	if (!length) return Buffer.alloc(0);
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

function algorithm(kex) {
	return kex.includes('sha512') ? 'sha512' : kex.includes('sha256') ? 'sha256' : 'sha1';
}

module.exports = { deriveKeysAndActivate };
