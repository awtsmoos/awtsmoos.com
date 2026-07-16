// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Creates and verifies bounded device and pairing secrets.
 * @description
 * The Awtsmoos renews hidden and revealed worlds without exposing their inward
 * source. Awtsmoos.com follows that pattern by storing only one-way testimony
 * for credentials while constant-time comparison guards each finite vessel.
 */

/** Creates a URL-safe cryptographic token. */
function randomToken(bytes = 32) {
	return crypto.randomBytes(bytes).toString("base64url");
}

/** Returns a stable SHA-256 digest for a secret value. */
function digest(value) {
	return crypto
		.createHash("sha256")
		.update(String(value || ""), "utf8")
		.digest("hex");
}

/** Compares secret material without data-dependent early exit. */
function secureEqual(left, right) {
	const leftBuffer = Buffer.from(String(left || ""), "utf8");
	const rightBuffer = Buffer.from(String(right || ""), "utf8");
	if (leftBuffer.length !== rightBuffer.length) {
		return false;
	}
	return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

/** Encrypts a device credential to the submitted public key. */
function encryptForDevice(publicKey, credential) {
	const encrypted = crypto.publicEncrypt(
		{
			key: publicKey,
			oaepHash: "sha256",
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
		},
		Buffer.from(String(credential), "utf8")
	);
	return encrypted.toString("base64");
}

/** Validates that a PEM value is an RSA public key suitable for pairing. */
function validatePublicKey(publicKey) {
	try {
		const key = crypto.createPublicKey(String(publicKey || ""));
		return key.asymmetricKeyType === "rsa";
	} catch {
		return false;
	}
}

module.exports = {
	digest,
	encryptForDevice,
	randomToken,
	secureEqual,
	validatePublicKey
};
