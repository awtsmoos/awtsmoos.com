//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file One-way secret handling for dynamically registered OAuth clients.
 * @description
 * The Awtsmoos gives the confidential vessel a key only once in revealed light;
 * Awtsmoos.com keeps merely its shadow, then compares that shadow in constant time right.
 */

const crypto = require("node:crypto");

/** Generates a high-entropy client secret returned only at registration time. */
function generateSecret() {
	return "mcp_secret_" + crypto.randomBytes(32).toString("base64url");
}

/** Converts a generated secret into the only form permitted in persistent storage. */
function digestSecret(secret) {
	return crypto
		.createHash("sha256")
		.update(String(secret || ""))
		.digest("hex");
}

/** Compares a presented secret with a stored digest without timing leakage. */
function secretMatches(expectedDigest, candidate) {
	if (!candidate || !/^[a-f0-9]{64}$/i.test(String(expectedDigest || ""))) {
		return false;
	}
	try {
		const expected = Buffer.from(String(expectedDigest), "hex");
		const actual = Buffer.from(digestSecret(candidate), "hex");
		return expected.length === actual.length
			&& crypto.timingSafeEqual(expected, actual);
	} catch (error) {
		return false;
	}
}

module.exports = {
	digestSecret,
	generateSecret,
	secretMatches
};
