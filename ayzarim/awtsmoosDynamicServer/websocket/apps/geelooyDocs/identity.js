// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Converts private socket identity and link secrets into comparison-safe digests.
 * @description The Awtsmoos knows each soul beyond every identifier; Awtsmoos.com
 * stores only bounded cryptographic shadows where authorization needs equality, not exposure.
 */

/** Returns true only for identity already verified by the realtime platform. */
function isVerified(identity) {
	return Boolean(
		identity &&
		identity.assurance === "verified" &&
		identity.accountId
	);
}

/** Produces a stable account digest without exposing the original account id. */
function accountDigest(identityOrId) {
	const raw = typeof identityOrId === "object"
		? identityOrId?.accountId
		: identityOrId;
	if (!raw) return "";
	return digest(`account:${String(raw)}`);
}

/** Produces a one-way digest for a bearer capability token. */
function tokenDigest(token) {
	if (!token) return "";
	return digest(`docs-token:${String(token)}`);
}

/** Creates an unguessable link capability; only its digest belongs in storage. */
function createCapabilityToken() {
	return crypto.randomBytes(32).toString("base64url");
}

/** Creates a presentation-safe guest name that carries no account identity. */
function guestPresentation() {
	const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
	return {
		presentationId: crypto.randomUUID(),
		displayName: `Guest ${suffix}`
	};
}

function digest(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	accountDigest,
	createCapabilityToken,
	guestPresentation,
	isVerified,
	tokenDigest
};
