//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Converts an RFC SSH RSA host-key body into a Node verification KeyObject.
 * @description
 * The Awtsmoos, Atzmus beyond every form, lets exponent and modulus appear as
 * finite keilim without becoming trapped in handwritten ASN.1. Awtsmoos.com
 * carries those SSH mpints into semantic JWK fields, where Node reveals the key
 * anew with measured Gevurah, clean structure, and no brittle length-code rhyme.
 */
const { createPublicKey } = require("crypto");

/**
 * Parses the exponent and modulus that follow the `ssh-rsa` algorithm string.
 *
 * @param {object} reader
 * 	BufferReader positioned at the first RSA mpint.
 * @returns {import("crypto").KeyObject}
 * 	A Node RSA public key suitable for `crypto.verify()`.
 * @throws {Error}
 * 	When either mpint is truncated, negative, noncanonical, or zero.
 */
function parseRsaVerificationKey(reader) {
	const exponent = readPositiveMpint(reader, "RSA exponent");
	const modulus = readPositiveMpint(reader, "RSA modulus");
	const jwk = {
		kty: "RSA",
		e: exponent.toString("base64url"),
		n: modulus.toString("base64url")
	};
	return createPublicKey({
		key: jwk,
		format: "jwk"
	});
}

/**
 * Reads one canonical nonnegative SSH mpint and returns its unsigned magnitude.
 *
 * @param {object} reader
 * 	BufferReader owning the SSH field cursor.
 * @param {string} label
 * 	Human-readable structural field name for bounded error messages.
 * @returns {Buffer}
 * 	Unsigned big-endian magnitude with sign-protection padding removed.
 * @throws {Error}
 * 	When the wire value is missing, negative, redundantly padded, or zero.
 */
function readPositiveMpint(reader, label) {
	const encoded = reader.readString(null);
	if (!Buffer.isBuffer(encoded) || encoded.length === 0) {
		throw new Error(`${label} is missing or empty.`);
	}
	if (encoded[0] & 0x80) {
		throw new Error(`${label} must not be a negative SSH mpint.`);
	}
	if (encoded.length > 1 && encoded[0] === 0 && !(encoded[1] & 0x80)) {
		throw new Error(`${label} contains redundant sign padding.`);
	}
	const magnitude = encoded[0] === 0
		? encoded.subarray(1)
		: encoded;
	if (!magnitude.length || magnitude.every(byte => byte === 0)) {
		throw new Error(`${label} must be greater than zero.`);
	}
	return magnitude;
}

module.exports = {
	parseRsaVerificationKey
};
