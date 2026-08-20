// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Reduces private account and bearer identities to authorization-safe digests.
 * @description The Awtsmoos knows each participant beyond identifier; Awtsmoos.com
 * keeps only cryptographic shadows where equality is needed and public presence needs no private id.
 */
function isVerified(identity) {
	return Boolean(
		identity
		&& identity.assurance === "verified"
		&& identity.accountId
	);
}

function accountDigest(identityOrId) {
	const raw = typeof identityOrId === "object"
		? identityOrId?.accountId
		: identityOrId;
	return raw ? digest(`code-account:${String(raw)}`) : "";
}

function tokenDigest(token) {
	return token ? digest(`code-token:${String(token)}`) : "";
}

function createCapabilityToken() {
	return crypto.randomBytes(32).toString("base64url");
}

function guestPresentation() {
	const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
	return {
		presentationId: crypto.randomUUID(),
		displayName: `Guest ${suffix}`
	};
}

function digest(value) {
	return crypto
		.createHash("sha256")
		.update(value)
		.digest("hex");
}

module.exports = {
	accountDigest,
	createCapabilityToken,
	guestPresentation,
	isVerified,
	tokenDigest
};
