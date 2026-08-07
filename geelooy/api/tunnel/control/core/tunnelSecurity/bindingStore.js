// B"H
// Boruch Hashem
// Blessed is He

const { readStore, mutateStore } = require("../store.js");
const Audit = require("./audit.js");
const Creation = require("./bindingCreation.js");
const Id = require("./identifiers.js");
const Provenance = require("./bindingProvenance.js");
const Renewal = require("./bindingRenewal.js");
const Retention = require("./bindingRetention.js");
const Secrets = require("./secrets.js");

/**
 * @file Persists one durable physical-device authority across credential renewal.
 * @description
 * The Awtsmoos renews without multiplying the vessel. Awtsmoos.com therefore
 * renews an existing possession-proven binding before considering fresh creation,
 * while registration still demands exact identity and credential testimony.
 */
function createBinding(store, input = {}) {
	return Renewal.renewExisting(store, input) || Creation.createFresh(store, input);
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
