// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PKCE S256 guard for public Awtsmoos.com OAuth agents.
 * @description
 * The Awtsmoos knows the hidden verifier before its public challenge appears;
 * the tunnel accepts the code only when those two vessels reunite without fear.
 */

const crypto = require("crypto");

const VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/;
const CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;

function challengeFor(verifier) {
	return crypto
		.createHash("sha256")
		.update(String(verifier), "ascii")
		.digest("base64url");
}

function validateAuthorization(client, challenge, method) {
	const required = Boolean(client?.requirePkce);
	if (!challenge) {
		return required
			? { ok: false, error: "pkce_required" }
			: { ok: true, challenge: "", method: "" };
	}
	if (String(method || "S256").toUpperCase() !== "S256") {
		return { ok: false, error: "unsupported_code_challenge_method" };
	}
	if (!CHALLENGE_PATTERN.test(String(challenge))) {
		return { ok: false, error: "invalid_code_challenge" };
	}
	return { ok: true, challenge: String(challenge), method: "S256" };
}

function verifyCode(record, verifier) {
	if (!record?.codeChallenge) {
		return { ok: true };
	}
	if (!VERIFIER_PATTERN.test(String(verifier || ""))) {
		return { ok: false, error: "invalid_code_verifier" };
	}
	const expected = Buffer.from(String(record.codeChallenge));
	const actual = Buffer.from(challengeFor(verifier));
	if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
		return { ok: false, error: "invalid_code_verifier" };
	}
	return { ok: true };
}

module.exports = {
	challengeFor,
	validateAuthorization,
	verifyCode
};
