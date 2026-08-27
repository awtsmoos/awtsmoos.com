// B"H

'use strict';

const { createECDH, createDiffieHellmanGroup, generateKeyPairSync,
	randomFillSync } = require('crypto');
const { MESSAGE, DEFAULT_KEX, DEFAULT_SERVER_HOST_KEY, DEFAULT_CIPHER,
	DEFAULT_MAC, DEFAULT_COMPRESSION } = require('./Binah-Constants.js');
const { BufferReader } = require('./Yesod-Utilities.js');

function sendKexInit() {
	if (this._kexinit_payload) return;
	this._debug?.('Key Exchange: Sending our KEXINIT.');
	const lists = [DEFAULT_KEX.join(','), DEFAULT_SERVER_HOST_KEY.join(','),
		DEFAULT_CIPHER.join(','), DEFAULT_CIPHER.join(','), DEFAULT_MAC.join(','),
		DEFAULT_MAC.join(','), DEFAULT_COMPRESSION.join(','),
		DEFAULT_COMPRESSION.join(','), '', ''];
	let size = 1 + 16 + 1 + 4;
	for (const list of lists) size += 4 + Buffer.byteLength(list);
	const payload = Buffer.allocUnsafe(size);
	let offset = 0;
	payload[offset++] = MESSAGE.KEXINIT;
	randomFillSync(payload, offset, 16);
	offset += 16;
	for (const list of lists) {
		const length = Buffer.byteLength(list);
		payload.writeUInt32BE(length, offset);
		offset += 4;
		if (length) {
			payload.write(list, offset, 'ascii');
			offset += length;
		}
	}
	payload[offset++] = 0;
	payload.writeUInt32BE(0, offset);
	this._kexinit_payload = payload;
	this._protocol.sendPacket(payload);
}

function negotiate() {
	const reader = new BufferReader(this._remote_kexinit_payload.slice(17));
	const remote = {
		kex: reader.readString('ascii').split(','),
		serverHostKey: reader.readString('ascii').split(','),
		csCipher: reader.readString('ascii').split(','),
		scCipher: reader.readString('ascii').split(','),
		csMAC: reader.readString('ascii').split(','),
		scMAC: reader.readString('ascii').split(','),
		csCompress: reader.readString('ascii').split(','),
		scCompress: reader.readString('ascii').split(',')
	};
	const first = (ours, theirs) => ours.find(name => theirs.includes(name));
	this.negotiated = {
		kex: first(DEFAULT_KEX, remote.kex),
		serverHostKey: first(DEFAULT_SERVER_HOST_KEY, remote.serverHostKey),
		csCipher: first(DEFAULT_CIPHER, remote.csCipher),
		scCipher: first(DEFAULT_CIPHER, remote.scCipher),
		csMAC: first(DEFAULT_MAC, remote.csMAC),
		scMAC: first(DEFAULT_MAC, remote.scMAC),
		csCompress: first(DEFAULT_COMPRESSION, remote.csCompress),
		scCompress: first(DEFAULT_COMPRESSION, remote.scCompress)
	};
	this._debug?.(`Negotiated Algorithms: ${JSON.stringify(this.negotiated)}`);
	if (Object.values(this.negotiated).some(value => !value)) {
		throw new Error('Failed to negotiate one or more algorithms.');
	}
}

function startKex() {
	const kex = this.negotiated.kex;
	let publicKey;
	if (kex.startsWith('curve25519')) {
		this._dh = generateKeyPairSync('x25519');
		publicKey = this._dh.publicKey.export({ type: 'spki', format: 'der' }).slice(-32);
	} else if (kex.startsWith('ecdh-sha2-')) {
		const curves = { nistp256: 'prime256v1', nistp384: 'secp384r1', nistp521: 'secp521r1' };
		this._dh = createECDH(curves[kex.split('-').pop()]);
		this._dh.generateKeys();
		publicKey = this._dh.getPublicKey();
	} else if (kex === 'diffie-hellman-group14-sha256') {
		this._dh = createDiffieHellmanGroup('modp3072');
		this._dh.generateKeys();
		publicKey = this._dh.getPublicKey();
	} else if (kex === 'diffie-hellman-group16-sha512') {
		this._dh = createDiffieHellmanGroup('modp4096');
		this._dh.generateKeys();
		publicKey = this._dh.getPublicKey();
	} else throw new Error(`Unsupported negotiated KEX algorithm: ${kex}`);
	const payload = Buffer.allocUnsafe(5 + publicKey.length);
	payload[0] = MESSAGE.KEXDH_INIT;
	payload.writeUInt32BE(publicKey.length, 1);
	publicKey.copy(payload, 5);
	this._protocol.sendPacket(payload);
}

module.exports = { negotiate, sendKexInit, startKex };
