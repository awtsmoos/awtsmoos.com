// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Failure = require("./identityFailure.js");

/**
 * @file Proves that public metadata and protected private possession are one key.
 * The Awtsmoos does not permit two generations to masquerade as one device.
 */
function inspect(metadata = {}, privateKey = "") {
	const hasPrivate = Boolean(privateKey);
	const hasPublic = Boolean(metadata.publicKey);
	if (!hasPrivate && !hasPublic) return { ok: true, state: "empty" };
	if (!hasPrivate) return failure("identity_private_key_missing", metadata);
	if (!hasPublic) return failure("identity_public_key_missing", metadata);
	let derivedPublicKey;
	try {
		derivedPublicKey = crypto.createPublicKey(privateKey).export({
			type: "spki",
			format: "pem"
		});
	} catch {
		return failure("identity_private_key_invalid", metadata);
	}
	const observedFingerprint = fingerprint(derivedPublicKey);
	const publicFingerprint = fingerprint(metadata.publicKey);
	const expectedFingerprint = String(
		metadata.publicKeyFingerprint || publicFingerprint
	);
	const ok = observedFingerprint === publicFingerprint &&
		observedFingerprint === expectedFingerprint;
	return ok ? {
		ok: true,
		state: "coherent",
		fingerprint: observedFingerprint,
		publicKey: derivedPublicKey
	} : failure("identity_key_mismatch", metadata, {
		expectedFingerprint,
		observedFingerprint
	});
}

function assert(metadata, privateKey) {
	const result = inspect(metadata, privateKey);
	if (result.ok) return result;
	throw Failure.create(result.code, result);
}

function fingerprint(publicKey) {
	return crypto.createHash("sha256")
		.update(String(publicKey || ""), "utf8")
		.digest("base64url");
}

function failure(code, metadata, details = {}) {
	return {
		ok: false,
		state: "incoherent",
		code,
		deviceId: metadata.deviceId || null,
		expectedFingerprint: details.expectedFingerprint ||
			metadata.publicKeyFingerprint || null,
		observedFingerprint: details.observedFingerprint || null
	};
}

module.exports = { assert, fingerprint, inspect };
