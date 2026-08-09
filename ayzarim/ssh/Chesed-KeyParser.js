// B"H

'use strict';

const { createPublicKey } = require('crypto');
const { BufferReader } = require('./Yesod-Utilities.js');

/** Converts an SSH host-key blob into a Node verification key. */
function parseKeyForVerification(keyBuffer) {
	const reader = new BufferReader(keyBuffer);
	const keyType = reader.readString('ascii');
	try {
		if (keyType === 'ssh-ed25519') return ed25519(reader);
		if (keyType === 'ssh-rsa') return rsa(reader);
		if (keyType.startsWith('ecdsa-sha2-nistp')) return ecdsa(reader, keyType);
		throw new Error(`Unsupported host key type for verification: ${keyType}`);
	} catch (error) {
		throw new Error(`Failed to parse host key type ${keyType}: ${error.message}`);
	}
}

function ed25519(reader) {
	const key = Buffer.concat([
		Buffer.from('302a300506032b6570032100', 'hex'),
		reader.readString(null)
	]);
	return createPublicKey({ key, format: 'der', type: 'spki' });
}

function rsa(reader) {
	const exponent = reader.readString(null);
	const modulus = reader.readString(null);
	const key = Buffer.concat([
		Buffer.from('30', 'hex'),
		encodeLength(modulus.length + exponent.length + 8),
		Buffer.from('02', 'hex'),
		encodeLength(modulus.length),
		modulus,
		Buffer.from('02', 'hex'),
		encodeLength(exponent.length),
		exponent
	]);
	const body = key.toString('base64').replace(/.{64}/g, '$&\n');
	return createPublicKey({
		key: `-----BEGIN RSA PUBLIC KEY-----\n${body}\n-----END RSA PUBLIC KEY-----`,
		format: 'pem',
		type: 'pkcs1'
	});
}

function ecdsa(reader, keyType) {
	reader.readString('ascii');
	const point = reader.readString(null);
	const oids = {
		'ecdsa-sha2-nistp256': '06082a8648ce3d030107',
		'ecdsa-sha2-nistp384': '06052b81040022',
		'ecdsa-sha2-nistp521': '06052b81040023'
	};
	const key = Buffer.concat([
		Buffer.from('30', 'hex'),
		encodeLength(19 + point.length),
		Buffer.from('301306072a8648ce3d0201', 'hex'),
		Buffer.from(oids[keyType], 'hex'),
		Buffer.from('03', 'hex'),
		encodeLength(point.length + 1),
		Buffer.from('00', 'hex'),
		point
	]);
	return createPublicKey({ key, format: 'der', type: 'spki' });
}

function encodeLength(length) {
	if (length < 128) return Buffer.from([length]);
	const count = 1 + (Math.log(length) / Math.log(256) | 0);
	const result = Buffer.alloc(count);
	result[0] = 0x80 | (count - 1);
	for (let index = 1; index < count; index += 1) {
		result[count - index] = (length >> ((index - 1) * 8)) & 0xff;
	}
	return result;
}

module.exports = { parseKeyForVerification };
