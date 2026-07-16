// B"H
// Boruch Hashem
// Blessed is He

const Id = require("./identifiers.js");

/**
 * @file Defines the versioned proof required before tunnel ownership is trusted.
 * @description
 * The Awtsmoos renews owner, device, pairing, and socket without confusing their
 * finite names. Awtsmoos.com accepts a native vessel only when persisted pairing
 * testimony and the live immutable identity agree in every security-bearing field.
 */

const PAIRING_PROOF_VERSION = 1;

/** Creates canonical proof fields for a newly approved pairing. */
function proofFields(input = {}) {
	const pairingId = Id.normalizeIdentifier(input.pairingId);
	const ownershipVerifiedAt = validInstant(input.ownershipVerifiedAt);
	const pairingProofVersion = Number(input.pairingProofVersion || 0);
	if (
		!pairingId.startsWith("pair_") ||
		!ownershipVerifiedAt ||
		pairingProofVersion !== PAIRING_PROOF_VERSION
	) {
		return null;
	}
	return {
		pairingId,
		ownershipVerifiedAt,
		pairingProofVersion
	};
}

/** Returns true only for complete, non-revoked, possession-backed bindings. */
function isTrustedBinding(binding = {}) {
	const proof = proofFields(binding);
	return Boolean(
		proof &&
		Id.accountId(binding.ownerAccountId) &&
		Id.normalizeIdentifier(binding.tunnelId) &&
		Id.tunnelName(binding.tunnelName) &&
		Id.deviceId(binding.deviceId) &&
		String(binding.credentialDigest || "").length >= 32 &&
		String(binding.devicePublicKey || "").trim() &&
		!binding.revokedAt
	);
}

/** Proves a live socket is the exact native device described by the binding. */
function sameLiveIdentity(binding = {}, client = {}) {
	return isTrustedBinding(binding) &&
		client.isTunnel === true &&
		client.accessKind === "device" &&
		Id.accountId(client.accountId) === binding.ownerAccountId &&
		Id.normalizeIdentifier(client.tunnelId) === binding.tunnelId &&
		Id.deviceId(client.deviceId) === binding.deviceId &&
		Id.tunnelName(client.tunnelName) === binding.tunnelName;
}

function validInstant(value) {
	const normalized = String(value || "").trim();
	return normalized && Number.isFinite(Date.parse(normalized))
		? new Date(normalized).toISOString()
		: "";
}

module.exports = {
	PAIRING_PROOF_VERSION,
	isTrustedBinding,
	proofFields,
	sameLiveIdentity
};
