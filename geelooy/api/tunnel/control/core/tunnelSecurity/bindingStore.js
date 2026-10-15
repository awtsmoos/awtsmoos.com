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
		// B"H — 2026-10-15: Fallback for agents with empty tunnelId.
		// If tunnelId is empty, search by deviceId + credential digest.
		let binding = null;
		let usedFallback = false;
		if (input.tunnelId && String(input.tunnelId).trim()) {
			binding = bindingById(input.tunnelId, store);
		} else {
			// Fallback: Find binding by deviceId and credential digest.
			usedFallback = true;
			const suppliedDigest = Secrets.digest(input.credential);
			const deviceId = Id.deviceId(input.deviceId);
			for (const tid of Object.keys(store.tunnelBindings || {})) {
				const b = store.tunnelBindings[tid];
				if (b && b.deviceId === deviceId && 
				    Secrets.secureEqual(b.credentialDigest, suppliedDigest) &&
				    Provenance.isTrustedBinding(b)) {
					binding = b;
					break;
				}
			}
		}
		const suppliedDigest = Secrets.digest(input.credential);
		// B"H — Yaakov 2026-10-15: In fallback mode (empty tunnelId), the agent
		// doesn't know its tunnelName. The credential digest match is sufficient.
		// Only enforce tunnelName match when tunnelId was provided.
		const identityMatches = Provenance.isTrustedBinding(binding) &&
			binding.deviceId === Id.deviceId(input.deviceId) &&
			(usedFallback || binding.tunnelName === Id.tunnelName(input.tunnelName));
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
