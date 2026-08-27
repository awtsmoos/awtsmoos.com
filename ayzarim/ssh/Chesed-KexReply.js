// B"H

'use strict';

const { createHash, createPublicKey, diffieHellman, verify } = require('crypto');
const { BufferReader } = require('./Yesod-Utilities.js');
const { encodePositiveMpint } = require('./Chesed-Mpint.js');
const { parseKeyForVerification } = require('./Chesed-KeyParser.js');

function handleDhReply(payload) {
	this._debug?.('Key Exchange: Processing KEXDH_REPLY.');
	const reader = new BufferReader(payload.slice(1));
	const hostKey = reader.readString(null);
	const serverPublic = reader.readString(null);
	const signatureBlob = reader.readString(null);
	const kex = this.negotiated.kex;
	const secret = sharedSecret(this, kex, serverPublic);
	this._kex_secret = encodePositiveMpint(secret);
	const hash = createHash(hashAlgorithm(kex));
	const hashString = value => {
		const length = Buffer.alloc(4);
		length.writeUInt32BE(value.length, 0);
		hash.update(length);
		hash.update(value);
	};
	const clientPublic = kex.startsWith('curve25519')
		? this._dh.publicKey.export({ type: 'spki', format: 'der' }).slice(-32)
		: this._dh.getPublicKey();
	hashString(this._protocol._identRaw);
	hashString(Buffer.from(this._protocol._remoteIdentRaw));
	hashString(this._kexinit_payload);
	hashString(this._remote_kexinit_payload);
	hashString(hostKey);
	hashString(clientPublic);
	hashString(serverPublic);
	hash.update(this._kex_secret);
	this._exchange_hash = hash.digest();
	if (!this.sessionID) this.sessionID = this._exchange_hash;
	verifySignature(this, hostKey, signatureBlob);
	this._deriveKeysAndActivate();
}

function sharedSecret(handler, kex, serverPublic) {
	if (kex.startsWith('curve25519')) {
		const publicKey = createPublicKey({
			key: Buffer.concat([
				Buffer.from('302a300506032b656e032100', 'hex'),
				serverPublic
			]),
			format: 'der',
			type: 'spki'
		});
		return diffieHellman({ privateKey: handler._dh.privateKey, publicKey });
	}
	if (kex.startsWith('ecdh-sha2-') || kex.startsWith('diffie-hellman-group')) {
		return handler._dh.computeSecret(serverPublic);
	}
	throw new Error(`Unsupported KEX for secret computation: ${kex}`);
}

function verifySignature(handler, hostKey, signatureBlob) {
	const reader = new BufferReader(signatureBlob);
	const signatureAlgorithm = reader.readString('ascii');
	const signature = reader.readString(null);
	const signatureHash = signatureAlgorithm.includes('512') ? 'sha512' :
		signatureAlgorithm.includes('256') ? 'sha256' :
		signatureAlgorithm === 'ssh-rsa' ? 'sha1' : undefined;
	const key = parseKeyForVerification(hostKey);
	if (!verify(signatureHash, handler._exchange_hash, key, signature)) {
		throw new Error('Host key signature verification failed. The server is not who it claims to be.');
	}
}

function hashAlgorithm(kex) {
	return kex.includes('sha512') ? 'sha512' : kex.includes('sha256') ? 'sha256' : 'sha1';
}

module.exports = { handleDhReply };
