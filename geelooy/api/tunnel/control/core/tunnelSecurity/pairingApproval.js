// B"H
// Boruch Hashem
// Blessed is He

const Audit = require("./audit.js");
const Binding = require("./bindingStore.js");
const Friendly = require("./pairingErrorMessages.js");
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
		return {
			ok: false,
			error: "pairing_not_found",
			message: Friendly.messageFor("pairing_not_found")
		};
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
		binding = recoverStaleIncompleteBinding(store, {
			...pairing,
			ownerAccountId: normalizedAccount,
			credential,
			pairingId: pairing.pairingId,
			ownershipVerifiedAt,
			pairingProofVersion: Provenance.PAIRING_PROOF_VERSION
		}, error);
		if (!binding) {
			return denied(store, pairing, normalizedAccount, error);
		}
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
	return { ok: true, tunnelId: binding.tunnelId, pairingId: pairing.pairingId };
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
	const code = publicError(error);
	return { ok: false, error: code, message: Friendly.messageFor(code) };
}

function publicError(error) {
	const code = String(error?.code || error?.message || "");
	return code.includes("binding") || code.includes("ownership")
		? "pairing_identity_conflict"
		: "pairing_binding_invalid";
}

/**
 * Recovers from an identity conflict against bindings that never came online.
 * A device whose previous pairing was approved but never registered (installer
 * died, network dropped) would otherwise be permanently wedged: every fresh
 * pairing ceremony fails closed against its own stale ghost. When every
 * conflicting binding for this device + account has never authenticated, the
 * freshly user-approved pairing ceremony is sufficient proof to supersede the
 * ghosts and create anew. Bindings that HAVE authenticated stay fail-closed.
 * Returns the new binding, or null when recovery does not apply.
 */
function recoverStaleIncompleteBinding(store, input, error) {
	if (publicError(error) !== "pairing_identity_conflict") return null;
	const deviceId = Id.deviceId(input.deviceId);
	const accountId = Id.accountId(input.ownerAccountId);
	if (!deviceId || !accountId) return null;
	const bindings = Object.values(store.tunnelBindings || {}).filter(binding => {
		return !binding.revokedAt &&
			Id.deviceId(binding.deviceId) === deviceId &&
			Id.accountId(binding.ownerAccountId) === accountId;
	});
	if (!bindings.length) return null;
	const anyAuthenticated = bindings.some(binding => Boolean(binding.lastAuthenticatedAt));
	if (anyAuthenticated) return null;
	const now = new Date().toISOString();
	for (const binding of bindings) {
		binding.revokedAt = now;
		binding.revocationVersion = Number(binding.revocationVersion || 0) + 1;
		binding.supersededAt = now;
		binding.supersededReason = "stale_incomplete_pairing";
	}
	Audit.appendAudit(store, {
		action: "pairing.supersede_stale",
		accountId,
		deviceId,
		supersededTunnelIds: bindings.map(binding => binding.tunnelId),
		result: "allowed"
	});
	return Binding.createBinding(store, input);
}

module.exports = { approveInStore, matchingPairing, publicError };
