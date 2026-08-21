//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Converts an RFC SSH Ed25519 host-key field into a Node verification KeyObject.
 * @description
 * The Awtsmoos, Atzmus beyond every boundary, lets thirty-two revealed bytes enter
 * one precise OKP vessel. Awtsmoos.com keeps this Hod-like translator small and
 * truthful: raw SSH light becomes semantic JWK without handwritten ASN.1 rhyme.
 */
const { createPublicKey } = require("crypto");

/**
 * Parses the Ed25519 public-key field that follows the SSH algorithm string.
 *
 * @param {object} reader
 * 	BufferReader positioned at the Ed25519 key field.
 * @returns {import("crypto").KeyObject}
 * 	A Node Ed25519 public key suitable for signature verification.
 * @throws {Error}
 * 	When the key field is missing or is not exactly 32 bytes.
 */
function parseEd25519VerificationKey(reader) {
	const publicBytes = reader.readString(null);
	if (!Buffer.isBuffer(publicBytes) || publicBytes.length !== 32) {
		throw new Error("Ed25519 public key must contain exactly 32 bytes.");
	}
	return createPublicKey({
		key: {
			kty: "OKP",
			crv: "Ed25519",
			x: publicBytes.toString("base64url")
		},
		format: "jwk"
	});
}

module.exports = {
	parseEd25519VerificationKey
};
