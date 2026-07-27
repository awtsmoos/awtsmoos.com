// B"H
// Boruch Hashem
// Blessed is He

const { readStore, mutateStore } = require("../store.js");
const Audit = require("./audit.js");
const Id = require("./identifiers.js");
const Lifecycle = require("./bindingLifecycle.js");
const Provenance = require("./bindingProvenance.js");
const Retention = require("./bindingRetention.js");
const Secrets = require("./secrets.js");

/**
	* @file Persists possession-backed ownership and prunes inert duplicate history.
	* @description
	* The Awtsmoos renews owner and device without multiplying stale authority.
	* Awtsmoos.com records supersession, retains a bounded audit tail, and removes
	* ancient revoked records only through the guarded retention covenant.
	*/
function createBinding(store, input = {}) {
	const proof = Provenance.proofFields(input);
	if (!proof) throw new Error("invalid_tunnel_ownership_proof");
	const now = new Date().toISOString();
	const binding = {
		tunnelId: `tun_${Secrets.randomToken(18)}`,
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
		createdAt: now,
		lastAuthenticatedAt: null,
		revokedAt: null
	};
	if (!Provenance.isTrustedBinding(binding)) {
		throw new Error("invalid_tunnel_binding");
	}
	binding.supersededTunnelIds = Lifecycle.supersedeDuplicates(store, binding, now);
	store.tunnelBindings[binding.tunnelId] = binding;
	binding.retention = Retention.pruneStore(store, {
		accountId: binding.ownerAccountId,
		at: now
	}).removed.map(item => item.tunnelId);
	return binding;
}

function bindingById(tunnelId, store = readStore()) {
	return store.tunnelBindings[Id.normalizeIdentifier(tunnelId)] || null;
}

function verifyRegistration(input = {}) {
	let result = { ok: false, error: "invalid_device_credential" };
	mutateStore(store => {
		const binding = bindingById(input.tunnelId, store);
		const suppliedDigest = Secrets.digest(input.credential);
		const identityMatches = Provenance.isTrustedBinding(binding) &&
			binding.deviceId === Id.deviceId(input.deviceId) &&
			binding.tunnelName === Id.tunnelName(input.tunnelName);
		if (!identityMatches || !Secrets.secureEqual(binding.credentialDigest, suppliedDigest)) {
			return store;
		}
		binding.lastAuthenticatedAt = new Date().toISOString();
		result = { ok: true, binding: { ...binding } };
		return store;
	});
	return result;
}

function revokeBinding(tunnelId, accountId) {
	let revoked = false;
	mutateStore(store => {
		const binding = bindingById(tunnelId, store);
		if (!binding || binding.ownerAccountId !== Id.accountId(accountId)) return store;
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

function pruneBindings(input = {}) {
	let result;
	mutateStore(store => {
		result = Retention.pruneStore(store, input);
		return store;
	});
	return result;
}

function planBindingPrune(input = {}, store = readStore()) {
	return Retention.plan(store, input);
}

module.exports = {
	bindingById,
	createBinding,
	planBindingPrune,
	pruneBindings,
	revokeBinding,
	verifyRegistration
};
