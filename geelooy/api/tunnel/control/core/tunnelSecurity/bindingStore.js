// B"H
// Boruch Hashem
// Blessed is He

const { readStore, mutateStore } = require("../store.js");
const Audit = require("./audit.js");
const Id = require("./identifiers.js");
const Provenance = require("./bindingProvenance.js");
const Secrets = require("./secrets.js");

/**
 * @file Persists possession-backed tunnel ownership and verifies registrations.
 * @description
 * The Awtsmoos renews owner and device without allowing a name or legacy record
 * to become essence. Awtsmoos.com stores immutable identity only after versioned
 * pairing proof and later requires the same credential, device, tunnel, and name.
 */

/** Creates one binding only from a verified pairing approval. */
function createBinding(store, input = {}) {
	const proof = Provenance.proofFields(input);
	if (!proof) {
		throw new Error("invalid_tunnel_ownership_proof");
	}
	const tunnelId = `tun_${Secrets.randomToken(18)}`;
	const binding = {
		tunnelId,
		tunnelName: Id.tunnelName(input.tunnelName),
		deviceId: Id.deviceId(input.deviceId),
		ownerAccountId: Id.accountId(input.ownerAccountId),
		credentialDigest: Secrets.digest(input.credential),
		devicePublicKey: String(input.devicePublicKey || "").trim(),
		deviceName: String(input.deviceName || "Tunnel Device").slice(0, 160),
		platform: String(input.platform || "unknown").slice(0, 80),
		...proof,
		keyVersion: 1,
		permissionVersion: 1,
		revocationVersion: 1,
		createdAt: new Date().toISOString(),
		lastAuthenticatedAt: null,
		revokedAt: null
	};
	if (!Provenance.isTrustedBinding(binding)) {
		throw new Error("invalid_tunnel_binding");
	}
	store.tunnelBindings[tunnelId] = binding;
	return binding;
}

/** Returns one binding by immutable tunnel ID. */
function bindingById(tunnelId, store = readStore()) {
	return store.tunnelBindings[Id.normalizeIdentifier(tunnelId)] || null;
}

/** Verifies native registration and updates authentication testimony. */
function verifyRegistration(input = {}) {
	let result = { ok: false, error: "invalid_device_credential" };
	mutateStore((store) => {
		const binding = bindingById(input.tunnelId, store);
		const suppliedDigest = Secrets.digest(input.credential);
		const identityMatches = Provenance.isTrustedBinding(binding) &&
			binding.deviceId === Id.deviceId(input.deviceId) &&
			binding.tunnelName === Id.tunnelName(input.tunnelName);
		const credentialMatches = identityMatches &&
			Secrets.secureEqual(binding.credentialDigest, suppliedDigest);
		if (!credentialMatches) {
			return store;
		}
		binding.lastAuthenticatedAt = new Date().toISOString();
		result = { ok: true, binding: { ...binding } };
		return store;
	});
	return result;
}

/** Revokes one owned device binding and increments its revocation version. */
function revokeBinding(tunnelId, accountId) {
	let revoked = false;
	mutateStore((store) => {
		const binding = bindingById(tunnelId, store);
		if (!binding || binding.ownerAccountId !== Id.accountId(accountId)) {
			return store;
		}
		binding.revokedAt = new Date().toISOString();
		binding.revocationVersion += 1;
		revoked = true;
		Audit.appendAudit(store, {
			action: "device.revoke",
			accountId,
			deviceId: binding.deviceId,
			tunnelId,
			result: "allowed"
		});
		return store;
	});
	return revoked;
}

module.exports = {
	bindingById,
	createBinding,
	revokeBinding,
	verifyRegistration
};
