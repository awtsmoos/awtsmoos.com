//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Stable host-key verification facade for the custom Awtsmoos SSH client.
 * @description
 * The Awtsmoos, Atzmus beyond all division, lets many key algorithms arrive as
 * distinct garments while one dispatcher keeps their covenant clear. Awtsmoos.com
 * sends each wire body to its truthful parser and leaves ASN.1 construction to Node,
 * so Chesed may receive many forms without losing Gevurah's measured rhyme.
 */
const { BufferReader } = require("./Yesod-Utilities.js");
const { parseEcdsaVerificationKey } = require("./hostKeys/EcdsaVerificationKey.js");
const { parseEd25519VerificationKey } = require("./hostKeys/Ed25519VerificationKey.js");
const { parseRsaVerificationKey } = require("./hostKeys/RsaVerificationKey.js");

const EXACT_PARSERS = Object.freeze({
	"ssh-ed25519": parseEd25519VerificationKey,
	"ssh-rsa": parseRsaVerificationKey
});

/**
 * Converts one complete RFC SSH host-key blob into a Node verification key.
 *
 * @param {Buffer|Uint8Array} keyBuffer
 * 	Complete SSH host-key blob including the leading algorithm string.
 * @returns {import("crypto").KeyObject}
 * 	Node public key accepted by `crypto.verify()`.
 * @throws {Error}
 * 	When the key is truncated, unsupported, structurally malformed, or has trailing bytes.
 */
function parseKeyForVerification(keyBuffer) {
	const source = Buffer.from(keyBuffer || []);
	const reader = new BufferReader(source);
	const keyType = reader.readString("ascii");
	if (!keyType) {
		throw new Error("SSH host key is missing its algorithm string.");
	}
	try {
		const parser = parserFor(keyType);
		const key = parser(reader, keyType);
		if (reader.avail() !== 0) {
			throw new Error("SSH host key contains unexpected trailing bytes.");
		}
		return key;
	} catch (error) {
		throw new Error(`Failed to parse host key type ${keyType}: ${error.message}`);
	}
}

/**
 * Resolves one SSH key algorithm to its focused verification parser.
 *
 * @param {string} keyType
 * 	SSH host-key algorithm name from the wire blob.
 * @returns {Function}
 * 	Parser accepting the remaining BufferReader and algorithm name.
 * @throws {Error}
 * 	When the host-key algorithm has no verification implementation.
 */
function parserFor(keyType) {
	if (EXACT_PARSERS[keyType]) {
		return EXACT_PARSERS[keyType];
	}
	if (keyType.startsWith("ecdsa-sha2-nistp")) {
		return parseEcdsaVerificationKey;
	}
	throw new Error(`Unsupported host key type for verification: ${keyType}`);
}

module.exports = {
	parseKeyForVerification
};
