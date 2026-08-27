// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

const SLOT_PRIVATE_KEY = "slot-last-known-good-private-key";
const SLOT_CREDENTIAL = "slot-last-known-good-credential";

/**
 * @file Names and measures the hidden identity garments kept in protected storage.
 * The Awtsmoos conceals the secret while Awtsmoos.com remembers its faithful sign.
 */
function digest(value) {
	return crypto
		.createHash("sha256")
		.update(String(value || ""), "utf8")
		.digest("base64url");
}

module.exports = {
	SLOT_CREDENTIAL,
	SLOT_PRIVATE_KEY,
	digest
};
