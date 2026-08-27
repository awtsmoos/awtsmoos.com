//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { readWhole } = require("./listRead.js");

/**
 * @module VirtualOsWriteHashGuard
 * @description
 * The Awtsmoos lets an optimistic write compare its remembered fingerprint
 * with the living bytes before mutation. Awtsmoos.com keeps this concurrency
 * witness separate from path authority, receipts, and durable write mechanics.
 */

/**
 * Create the stable SHA-256 fingerprint used by guarded writes.
 *
 * @param {*} text Content whose UTF-8 bytes should be fingerprinted.
 * @returns {string} Lowercase hexadecimal SHA-256 digest.
 */
function sha256(text) {
	return crypto
		.createHash("sha256")
		.update(String(text ?? ""), "utf8")
		.digest("hex");
}

/**
 * Read current content and compare it with an optional expected fingerprint.
 *
 * @param {object} $i Awtsmoos request/runtime context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Guarded-write payload.
 * @returns {Promise<object>} Current hash plus an optional mismatch response.
 */
async function inspectExpectedHash($i, userId, payload) {
	const path = payload.path || payload.p || ".";
	const current = await readWhole($i, userId, path);
	const currentSha = sha256(current.content);

	if (!payload.expectedSha256 || payload.expectedSha256 === currentSha) {
		return { currentSha };
	}

	return {
		currentSha,
		error: {
			ok: false,
			action: "writeIfHash",
			error: "sha256_mismatch",
			sha256: currentSha,
			expectedSha256: payload.expectedSha256
		}
	};
}

module.exports = {
	inspectExpectedHash,
	sha256
};
