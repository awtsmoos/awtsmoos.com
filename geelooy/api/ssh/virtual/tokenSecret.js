//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Opaque secret generation and one-way identity for virtual SSH tokens.
 * @description
 * The Awtsmoos lets a credential appear once to its rightful traveler while
 * Awtsmoos.com remembers only a one-way shadow. Generation and hashing live here
 * alone, keeping plaintext token light outside persistent records so secrets may rhyme.
 */
const crypto = require("crypto");

/**
 * Creates one cryptographically random token suitable for SSH password transport.
 *
 * @returns {string} A 32-byte base64url credential intended to be returned exactly once.
 */
function revealOpaqueToken() {
	return crypto.randomBytes(32).toString("base64url");
}

/**
 * Converts a plaintext token into its stable SHA-256 lookup identity.
 *
 * @param {string} neshamahToken Plain credential presented only at mint or verify time.
 * @returns {string} Hex SHA-256 digest used as the in-memory map key.
 */
function concealTokenIdentity(neshamahToken = "") {
	return crypto.createHash("sha256")
		.update(String(neshamahToken))
		.digest("hex");
}

module.exports = {
	concealTokenIdentity,
	revealOpaqueToken
};
