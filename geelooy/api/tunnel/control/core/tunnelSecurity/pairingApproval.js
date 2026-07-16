// B"H
// Boruch Hashem
// Blessed is He

const Audit = require("./audit.js");
const Binding = require("./bindingStore.js");
const Id = require("./identifiers.js");
const Provenance = require("./bindingProvenance.js");
const Secrets = require("./secrets.js");

/**
 * @file Converts one matching pairing code into possession-backed ownership.
 * @description
 * The Awtsmoos renews code, account, credential, and device in one guarded act.
 * Awtsmoos.com records versioned pairing provenance before the binding can enter
 * authorization, then returns the reusable credential only encrypted to the device.
 */

/** Approves one pending pairing inside an already mutable store. */
function approveInStore(store, accountId, userCode) {
	const normalizedAccount = Id.accountId(accountId);
	const pairing = matchingPairing(store, userCode);
	if (!pairing || !normalizedAccount) {
		return { ok: false, error: "pairing_not_found" };
	}
	const credential = Secrets.randomToken(48);
	const ownershipVerifiedAt = new Date().toISOString();
	const binding = Binding.createBinding(store, {
		...pairing,
		ownerAccountId: normalizedAccount,
		credential,
		pairingId: pairing.pairingId,
		ownershipVerifiedAt,
		pairingProofVersion: Provenance.PAIRING_PROOF_VERSION
	});
	Object.assign(pairing, {
		state: "approved",
		ownerAccountId: normalizedAccount,
		tunnelId: binding.tunnelId,
		ownershipVerifiedAt,
		pairingProofVersion: Provenance.PAIRING_PROOF_VERSION,
		credentialEnvelope: Secrets.encryptForDevice(
			pairing.devicePublicKey,
			credential
		),
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
	return Object.values(store.tunnelPairings).find((candidate) => {
		return candidate.state === "pending" &&
			candidate.expiresAt > Date.now() &&
			Secrets.secureEqual(candidate.userCodeDigest, codeDigest);
	}) || null;
}

module.exports = {
	approveInStore,
	matchingPairing
};
