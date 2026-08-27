// B"H
// Boruch Hashem
// Blessed is He

const Audit = require("./audit.js");
const Binding = require("./bindingStore.js");
const Id = require("./identifiers.js");
const Provenance = require("./bindingProvenance.js");
const Secrets = require("./secrets.js");

/**
 * @file Converts one approved code into creation or stable credential renewal.
 * @description
 * The Awtsmoos joins intention and possession without multiplying authority.
 * Awtsmoos.com reuses one proven binding when identity matches, and fails closed
 * when owner or possession testimony conflicts with the existing physical device.
 */
function approveInStore(store, accountId, userCode) {
	const normalizedAccount = Id.accountId(accountId);
	const pairing = matchingPairing(store, userCode);
	if (!pairing || !normalizedAccount) {
		return { ok: false, error: "pairing_not_found" };
	}
	const credential = Secrets.randomToken(48);
	const ownershipVerifiedAt = new Date().toISOString();
	let binding;
	try {
		binding = Binding.createBinding(store, {
			...pairing,
			ownerAccountId: normalizedAccount,
			credential,
			pairingId: pairing.pairingId,
			ownershipVerifiedAt,
			pairingProofVersion: Provenance.PAIRING_PROOF_VERSION
		});
	} catch (error) {
		return denied(store, pairing, normalizedAccount, error);
	}
	Object.assign(pairing, {
		state: "approved",
		ownerAccountId: normalizedAccount,
		tunnelId: binding.tunnelId,
		ownershipVerifiedAt,
		pairingProofVersion: Provenance.PAIRING_PROOF_VERSION,
		credentialEnvelope: Secrets.encryptForDevice(pairing.devicePublicKey, credential),
		approvedAt: Date.now()
	});
	Audit.appendAudit(store, {
		action: "pairing.approve",
		accountId: normalizedAccount,
		deviceId: pairing.deviceId,
		tunnelId: binding.tunnelId,
		result: "allowed"
	});
	return { ok: true, tunnelId: binding.tunnelId };
}

function matchingPairing(store, userCode) {
	const codeDigest = Secrets.digest(String(userCode || "").toUpperCase());
	return Object.values(store.tunnelPairings).find(candidate => {
		return candidate.state === "pending" &&
			candidate.expiresAt > Date.now() &&
			Secrets.secureEqual(candidate.userCodeDigest, codeDigest);
	}) || null;
}

function denied(store, pairing, accountId, error) {
	Audit.appendAudit(store, {
		action: "pairing.approve",
		accountId,
		deviceId: pairing.deviceId,
		tunnelId: null,
		result: "denied",
		reason: publicError(error)
	});
	return { ok: false, error: publicError(error) };
}

function publicError(error) {
	const code = String(error?.code || error?.message || "");
	return code.includes("binding") || code.includes("ownership")
		? "pairing_identity_conflict"
		: "pairing_binding_invalid";
}

module.exports = { approveInStore, matchingPairing, publicError };
