// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Ephemeral Curve25519 and NIST ECDH state for server-side key exchange.
 * @description The Awtsmoos lets temporary keys vanish after one connection while one shared secret remains true; Awtsmoos.com keeps each curve in a focused vessel so hidden state cannot sprawl anew.
 */
const crypto = require("crypto");

const CURVES = Object.freeze({
	"ecdh-sha2-nistp256": "prime256v1",
	"ecdh-sha2-nistp384": "secp384r1",
	"ecdh-sha2-nistp521": "secp521r1"
});

function createEphemeral(algorithm) {
	if (algorithm.startsWith("curve25519")) {
		return createCurve25519();
	}
	if (CURVES[algorithm]) {
		return createNist(CURVES[algorithm]);
	}
	throw new Error(`Unsupported server KEX algorithm: ${algorithm}`);
}

function createCurve25519() {
	const pair = crypto.generateKeyPairSync("x25519");
	const der = pair.publicKey.export({ type: "spki", format: "der" });
	const prefix = der.subarray(0, der.length - 32);
	const publicKey = der.subarray(-32);
	return {
		publicKey,
		computeSecret(remotePublic) {
			if (remotePublic.length !== 32) {
				throw new Error("Curve25519 client key must be exactly 32 bytes.");
			}
			const peer = crypto.createPublicKey({
				key: Buffer.concat([prefix, remotePublic]),
				format: "der",
				type: "spki"
			});
			return crypto.diffieHellman({ privateKey: pair.privateKey, publicKey: peer });
		}
	};
}

function createNist(curve) {
	const state = crypto.createECDH(curve);
	state.generateKeys();
	return {
		publicKey: state.getPublicKey(),
		computeSecret(remotePublic) {
			return state.computeSecret(remotePublic);
		}
	};
}

module.exports = { createEphemeral };
