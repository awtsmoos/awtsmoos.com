// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Binding = require("../core/tunnelSecurity/bindingStore.js");
const Provenance = require("../core/tunnelSecurity/bindingProvenance.js");
const Secrets = require("../core/tunnelSecurity/secrets.js");
const Store = require("../core/store.js");

/**
 * @file Proves credential renewal cannot multiply one physical tunnel identity.
 * @description
 * The Awtsmoos renews authorization while one vessel remains one vessel.
 * Awtsmoos.com preserves the tunnel ID for matching owner/device/key testimony,
 * rejects conflicting possession, and never revives a revoked binding in place.
 */
(() => {
	const store = Store.emptyStore();
	const first = Binding.createBinding(store, input("credential-one", "pair_one"));
	const firstTunnelId = first.tunnelId;
	const firstDigest = first.credentialDigest;
	const renewed = Binding.createBinding(store, input("credential-two", "pair_two"));
	assert.equal(renewed.tunnelId, firstTunnelId);
	assert.equal(Object.keys(store.tunnelBindings).length, 1);
	assert.notEqual(renewed.credentialDigest, firstDigest);
	assert.equal(renewed.credentialDigest, Secrets.digest("credential-two"));
	assert.throws(
		() => Binding.createBinding(store, input("bad-owner", "pair_three", {
			ownerAccountId: "account_other"
		})),
		error => error.code === "device_binding_owner_mismatch"
	);
	assert.throws(
		() => Binding.createBinding(store, input("bad-key", "pair_four", {
			devicePublicKey: "public-key-other"
		})),
		error => error.code === "device_binding_key_mismatch"
	);
	first.revokedAt = new Date().toISOString();
	first.revocationVersion += 1;
	const replacement = Binding.createBinding(store, input("credential-three", "pair_five"));
	assert.notEqual(replacement.tunnelId, firstTunnelId);
	assert.equal(store.tunnelBindings[firstTunnelId].revokedAt, first.revokedAt);
	assert.equal(Object.keys(store.tunnelBindings).length, 2);
	proveAmbiguityFailsClosed();
	console.log(JSON.stringify({
		ok: true,
		suite: "tunnel-binding-renewal",
		stableTunnelId: firstTunnelId
	}));
})();

function input(credential, pairingId, patch = {}) {
	return {
		deviceId: "dev_stability_device",
		tunnelName: "awt-awtsmoos-7572",
		deviceName: "Stability Fixture",
		platform: "darwin-x64",
		devicePublicKey: "public-key-stability",
		ownerAccountId: "account_owner",
		credential,
		pairingId,
		ownershipVerifiedAt: new Date().toISOString(),
		pairingProofVersion: Provenance.PAIRING_PROOF_VERSION,
		...patch
	};
}

function proveAmbiguityFailsClosed() {
	const store = Store.emptyStore();
	const first = Binding.createBinding(store, input("one", "pair_ambiguous_one"));
	store.tunnelBindings.tun_ambiguous_clone = {
		...first,
		tunnelId: "tun_ambiguous_clone"
	};
	assert.throws(
		() => Binding.createBinding(store, input("two", "pair_ambiguous_two")),
		error => error.code === "ambiguous_device_binding"
	);
}
