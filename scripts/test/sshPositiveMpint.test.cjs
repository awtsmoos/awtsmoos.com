// B"H

'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const test = require('node:test');
const { encodePositiveMpint } = require('../../ayzarim/ssh/Chesed-Mpint.js');

test('positive SSH mpint uses canonical zero and sign encoding', () => {
	assert.deepEqual(encodePositiveMpint(Buffer.alloc(0)), Buffer.alloc(4));
	assert.deepEqual(encodePositiveMpint(Buffer.from([0])), Buffer.alloc(4));
	assert.deepEqual(
		encodePositiveMpint(Buffer.from([0, 0, 1])),
		Buffer.from([0, 0, 0, 1, 1])
	);
	assert.deepEqual(
		encodePositiveMpint(Buffer.from([0x80])),
		Buffer.from([0, 0, 0, 2, 0, 0x80])
	);
	assert.deepEqual(
		encodePositiveMpint(Buffer.from([0, 0x80])),
		Buffer.from([0, 0, 0, 2, 0, 0x80])
	);
});

test('fixed-width X25519 secrets lose redundant leading zeroes', () => {
	const observed = findShortenableSecret(8192);
	assert.ok(observed, 'expected a shortenable X25519 secret');
	const encoded = encodePositiveMpint(observed);
	assert.equal(encoded.readUInt32BE(0), observed.length - 1);
	assert.deepEqual(encoded.subarray(4), observed.subarray(1));
});

test('key exchange uses the canonical positive mpint encoder', () => {
	const source = fs.readFileSync(
		require.resolve('../../ayzarim/ssh/Chesed-KexReply.js'),
		'utf8'
	);
	assert.match(source, /this\._kex_secret = encodePositiveMpint\(secret\)/);
});

function findShortenableSecret(limit) {
	for (let attempt = 0; attempt < limit; attempt += 1) {
		const first = crypto.generateKeyPairSync('x25519');
		const second = crypto.generateKeyPairSync('x25519');
		const secret = crypto.diffieHellman({
			privateKey: first.privateKey,
			publicKey: second.publicKey
		});
		if (secret[0] === 0 && secret[1] > 0 && secret[1] < 0x80) return secret;
	}
	return null;
}
